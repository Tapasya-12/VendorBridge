import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SuccessAnimation,
  SuccessCheckmark,
  ErrorAnimation,
  ErrorX,
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  StatusAnimation,
  StatusBadge,
  ProgressAnimation,
} from "@/components/ui/animations";

export default function AnimationsDemo() {
  const [progress, setProgress] = useState(45);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Animation Components Demo</h1>
        <p className="text-muted-foreground mt-1">
          Showcase of all available animation components in VendorBridge
        </p>
      </div>

      <Tabs defaultValue="success" className="space-y-6">
        <TabsList>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="success" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Success Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Circle Variant (Default)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Small</p>
                    <SuccessAnimation size="sm" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Medium</p>
                    <SuccessAnimation size="md" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Large</p>
                    <SuccessAnimation size="lg" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">X-Large</p>
                    <SuccessAnimation size="xl" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Bounce Variant</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <SuccessAnimation size="lg" text="Action Completed!" variant="bounce" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Checkmark Variant</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <SuccessAnimation size="lg" text="Saved successfully" variant="checkmark" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">SVG Checkmark</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <SuccessCheckmark />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Circle Variant (Default)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Small</p>
                    <ErrorAnimation size="sm" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Medium</p>
                    <ErrorAnimation size="md" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Large</p>
                    <ErrorAnimation size="lg" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">X-Large</p>
                    <ErrorAnimation size="xl" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Shake Variant</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <ErrorAnimation size="lg" text="Operation Failed!" variant="shake" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">X Variant</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <ErrorAnimation size="lg" text="Unable to proceed" variant="x" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Alert Variant</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <ErrorAnimation size="lg" text="Something went wrong" variant="alert" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">SVG Error X</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <ErrorX />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Spinner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Small</p>
                    <LoadingSpinner size="sm" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Medium</p>
                    <LoadingSpinner size="md" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Large</p>
                    <LoadingSpinner size="lg" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">X-Large</p>
                    <LoadingSpinner size="xl" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Loading with Text</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <LoadingSpinner size="lg" text="Processing your request..." />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Dots</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <LoadingDots />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Loading Pulse</h3>
                <div className="flex justify-center p-8 border rounded-lg">
                  <LoadingPulse />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Animation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Loading</p>
                    <StatusAnimation status="loading" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Success</p>
                    <StatusAnimation status="success" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Error</p>
                    <StatusAnimation status="error" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Warning</p>
                    <StatusAnimation status="warning" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Pending</p>
                    <StatusAnimation status="pending" />
                  </div>
                  <div className="flex flex-col items-center p-6 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">Idle</p>
                    <StatusAnimation status="idle" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Status with Text</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex justify-center p-6 border rounded-lg">
                    <StatusAnimation status="loading" text="Processing" />
                  </div>
                  <div className="flex justify-center p-6 border rounded-lg">
                    <StatusAnimation status="success" text="Completed" />
                  </div>
                  <div className="flex justify-center p-6 border rounded-lg">
                    <StatusAnimation status="error" text="Failed" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
                <div className="flex flex-wrap gap-4 p-6 border rounded-lg">
                  <StatusBadge status="loading" text="Loading" />
                  <StatusBadge status="success" text="Completed" />
                  <StatusBadge status="error" text="Failed" />
                  <StatusBadge status="warning" text="Warning" />
                  <StatusBadge status="pending" text="Pending" />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Progress Animation</h3>
                <div className="space-y-6 p-6 border rounded-lg">
                  <ProgressAnimation progress={progress} text="Upload progress" />
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => setProgress(Math.max(0, progress - 10))}
                      disabled={progress === 0}
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                      disabled={progress === 100}
                    >
                      +10%
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setProgress(0)}>
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Import:</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`import { 
  SuccessAnimation, 
  ErrorAnimation, 
  LoadingSpinner,
  StatusAnimation,
  StatusBadge
} from "@/components/ui/animations";`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Basic Usage:</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`// Success
<SuccessAnimation size="lg" text="Created!" variant="bounce" />

// Error
<ErrorAnimation size="md" text="Failed" variant="shake" />

// Loading
<LoadingSpinner size="sm" text="Loading..." />

// Status
<StatusAnimation status="success" text="Complete" />
<StatusBadge status="pending" text="Pending Approval" />`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
