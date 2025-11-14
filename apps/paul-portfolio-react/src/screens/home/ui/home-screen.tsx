import { InfiniteList } from '@features/infinite-list';

export function HomeScreen() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Paul Portfolio
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Infinite scrolling demonstration with modern React and Next.js
          </p>
        </section>

        {/* Infinite List Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Infinite List Demo
          </h2>
          <InfiniteList />
        </section>
      </div>
    </div>
  );
}
