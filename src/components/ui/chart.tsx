
import * as React from "react"
import { cn } from "@/lib/utils"
import * as Recharts from "recharts"

// Create a context for the chart
const ChartContext = React.createContext<{ parentHeight: number; parentWidth: number } | null>(null)

// Hook to access chart context
function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a Chart")
  }
  return context
}

// Helper function to get payload config
function getPayloadConfigFromPayload(payload: any) {
  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    return null
  }
  return payload[0].payload
}

// Chart wrapper component
const Chart = React.forwardRef<
  React.ElementRef<typeof Recharts.ResponsiveContainer>,
  React.ComponentPropsWithoutRef<typeof Recharts.ResponsiveContainer>
>(({ children, ...props }, ref) => (
  <Recharts.ResponsiveContainer
    ref={ref}
    width="100%"
    height={350}
    {...props}
  >
    {children}
  </Recharts.ResponsiveContainer>
))
Chart.displayName = "Chart"

// Tooltip component
const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof Recharts.Tooltip>,
  React.ComponentPropsWithoutRef<typeof Recharts.Tooltip>
>(({ cursor, content, ...props }, ref) => (
  <Recharts.Tooltip
    ref={ref}
    content={({ active, payload, label }) => {
      if (!active || !payload) {
        return null
      }

      const payloadConfig = getPayloadConfigFromPayload(payload)
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid grid-flow-col gap-2">
            <div className="font-semibold">{label}</div>
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }}
    cursor={cursor || { fill: "hsl(var(--muted))", opacity: 0.2 }}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

// Bar component
const ChartBar = (props: any) => (
  <Recharts.Bar {...props} />
)
ChartBar.displayName = "ChartBar"

// Area component
const ChartArea = (props: any) => (
  <Recharts.Area {...props} />
)
ChartArea.displayName = "ChartArea"

export {
  Chart,
  ChartTooltip,
  ChartBar,
  ChartArea,
  useChart,
  getPayloadConfigFromPayload,
}

export {
  Recharts,
}
