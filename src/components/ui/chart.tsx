import React, { createContext, useContext } from 'react';
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

// Context for chart configuration
interface ChartConfig {
  [key: string]: {
    theme?: {
      light?: string;
      dark?: string;
    };
  };
}

const ChartContext = createContext<ChartConfig | null>(null);

// Chart container component that provides configuration context
function ChartContainer({
  children,
  config = {},
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  config?: ChartConfig;
}) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

// Tooltip component for charts
function ChartTooltip({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-2 shadow-md',
        className
      )}
      {...props}
    />
  );
}

// Tooltip content component with styling
function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  className,
  ...props
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number, name: string) => React.ReactNode;
} & React.ComponentProps<'div'>) {
  const config = useContext(ChartContext);

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn('rounded-lg border bg-background p-2 shadow-md', className)}
      {...props}
    >
      {label && <p className="mb-2 font-medium">{label}</p>}
      <div className="flex flex-col gap-1.5">
        {payload.map((item: any, index: number) => {
          const color =
            config?.[item.dataKey]?.theme?.light || item.color || '#888';
          const formattedValue = formatter
            ? formatter(item.value, item.name)
            : item.value;

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useContext(ChartContext);

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
