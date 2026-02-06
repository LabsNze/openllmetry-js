'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      title: 'Install Error Tracking',
      description: 'Add the error tracking SDK to your application',
      icon: '📦',
      details: [
        'npm install @errorwatch/sdk',
        'Initialize in your app entry point',
        'Configure with your project ID'
      ]
    },
    {
      title: 'Configure Alerts',
      description: 'Set up alert rules for critical errors',
      icon: '🔔',
      details: [
        'Define error severity thresholds',
        'Choose notification channels',
        'Set up team notifications'
      ]
    },
    {
      title: 'Invite Team Members',
      description: 'Share your dashboard with your team',
      icon: '👥',
      details: [
        'Generate shareable links',
        'Set access permissions',
        'Send team invitations'
      ]
    },
    {
      title: 'Start Monitoring',
      description: 'Begin tracking errors in real-time',
      icon: '🎯',
      details: [
        'View live error stream',
        'Monitor dashboard metrics',
        'Analyze error patterns'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {!isComplete ? (
          <>
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get Started with ErrorWatch
              </h1>
              <p className="text-lg text-muted-foreground">
                Follow these simple steps to set up error monitoring for your application
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                {steps.map((_, idx) => (
                  <div key={idx} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(idx + 1)}
                      className={`w-10 h-10 rounded-full font-bold transition-all flex items-center justify-center ${
                        currentStep > idx + 1
                          ? 'bg-green-600 text-white'
                          : currentStep === idx + 1
                          ? 'bg-primary text-primary-foreground scale-110'
                          : 'bg-surface border border-border text-muted-foreground'
                      }`}
                    >
                      {currentStep > idx + 1 ? '✓' : idx + 1}
                    </button>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 transition-colors ${
                          currentStep > idx + 1 ? 'bg-green-600' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="card p-8">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-5xl">{steps[currentStep - 1].icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>

              <div className="bg-surface/50 border border-border rounded-lg p-6 mb-8">
                <ul className="space-y-3">
                  {steps[currentStep - 1].details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Example */}
              {currentStep === 1 && (
                <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto mb-8">
                  <pre className="text-foreground/80">{`import { ErrorWatch } from '@errorwatch/sdk';

ErrorWatch.init({
  projectId: 'your-project-id',
  dsn: 'https://your-dsn@errorwatch.io',
  environment: 'production'
});`}</pre>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentStep === steps.length) {
                      setIsComplete(true);
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  className="btn btn-primary"
                >
                  {currentStep === steps.length ? 'Complete Setup' : 'Next Step'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Completion Screen */
          <div className="card p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Setup Complete!
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your error monitoring dashboard is now ready to track errors in real-time.
            </p>
            
            <div className="bg-surface/50 border border-border rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Integrate the SDK into your application</li>
                <li>• Create your first alert rules</li>
                <li>• Invite your team members</li>
                <li>• Start monitoring your errors</li>
              </ul>
            </div>

            <Link href="/dashboard" className="btn btn-primary btn-lg inline-block">
              Go to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
