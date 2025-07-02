import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@omnia-k2d/shadcn-ui';

export default function Index() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">My Daily App</h1>
          <p className="text-lg text-muted-foreground">Welcome to your daily dashboard!</p>
        </div>
        
        {/* Button 예제 */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Various button styles and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button >Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
              <Button variant="neumorphic" size="sm">Neumorphic Button</Button>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🚀</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 예제 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>Your tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Complete project setup</p>
              <p>Review code changes</p>
              <p>Team meeting at 3 PM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weather</CardTitle>
              <CardDescription>Today&apos;s forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">22°C</div>
              <p className="text-muted-foreground">Partly cloudy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your progress today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tasks completed</span>
                  <span className="font-semibold">3/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours worked</span>
                  <span className="font-semibold">6.5h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
