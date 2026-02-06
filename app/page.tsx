'use client';

import Link from 'next/link';

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="navbar px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">ErrorWatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              Dashboard
            </Link>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Real-time Error Monitoring for Modern Teams
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Catch errors before your users do. Intelligent detection, instant alerts, and seamless team collaboration all in one platform.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Start Monitoring
              </Link>
              <Link href="/dashboard/analytics" className="btn btn-outline btn-lg">
                View Analytics
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl"></div>
            <div className="relative stat-card-highlight space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Active Alerts</span>
                <span className="pulse-indicator"></span>
              </div>
              <div className="text-4xl font-bold">2.3K</div>
              <div className="text-sm text-muted-foreground">across 12 projects</div>
              <div className="pt-4 border-t border-border flex justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-lg font-semibold">45ms</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                  <div className="text-lg font-semibold">99.8%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-8 py-24 bg-surface/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Monitoring</h2>
            <p className="text-lg text-muted-foreground">Everything you need to detect, analyze, and resolve errors fast</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Real-time Detection',
                description: 'Instant error notifications with automatic grouping and pattern recognition'
              },
              {
                icon: '🎯',
                title: 'Smart Alerts',
                description: 'Customizable alert rules with intelligent severity determination'
              },
              {
                icon: '👥',
                title: 'Team Collaboration',
                description: 'Share dashboards with team members via secure shareable links'
              },
              {
                icon: '📊',
                title: 'Rich Analytics',
                description: 'Interactive charts showing error trends and affected users'
              },
              {
                icon: '🔍',
                title: 'Stack Traces',
                description: 'Detailed error analysis with breadcrumb tracking'
              },
              {
                icon: '🚀',
                title: 'Async Processing',
                description: 'Reliable job processing via Upstash QStash'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card p-6 hover:border-primary/50">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Errors Detected', value: '2.3M+' },
              { label: 'Teams Active', value: '5.2K+' },
              { label: 'Avg Response Time', value: '45ms' },
              { label: 'System Uptime', value: '99.98%' }
            ].map((stat, idx) => (
              <div key={idx} className="stat-card text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-24 bg-surface/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start Monitoring Your Errors Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of teams that use ErrorWatch to catch and fix bugs before users report them.
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 md:px-8 py-12 bg-surface/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built with Next.js, React, and Tailwind CSS</p>
          <p className="mt-2">© 2024 ErrorWatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
