
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Code, 
  ExternalLink, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface BuildError {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  code?: string;
  category: string;
  timestamp: Date;
  resolved: boolean;
  guidance?: string[];
}

interface ErrorGuidanceProps {
  error: BuildError;
}

const ErrorGuidance: React.FC<ErrorGuidanceProps> = ({ error }) => {
  const getErrorGuidance = (error: BuildError) => {
    const guidance = {
      // Syntax Errors
      'Unexpected token': {
        title: 'Syntax Error - Unexpected Token',
        steps: [
          'Check for missing semicolons, commas, or brackets',
          'Ensure proper closing of strings and comments',
          'Verify correct JSX syntax if in React components',
          'Look for typos in keywords or identifiers'
        ],
        examples: [
          'Missing semicolon: `const x = 5` → `const x = 5;`',
          'Unclosed string: `"Hello world` → `"Hello world"`',
          'Missing bracket: `if (condition { }` → `if (condition) { }`'
        ],
        resources: [
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token'
        ]
      },
      
      // Type Errors
      'Type': {
        title: 'TypeScript Type Error',
        steps: [
          'Check if the variable is properly typed',
          'Ensure imported types are correct',
          'Verify function parameters match expected types',
          'Add proper type annotations if missing'
        ],
        examples: [
          'Wrong type: `const num: number = "string"` → `const num: number = 123`',
          'Missing type: `function test(param)` → `function test(param: string)`'
        ],
        resources: [
          'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'
        ]
      },
      
      // Import Errors
      'Cannot resolve module': {
        title: 'Module Import Error',
        steps: [
          'Check if the module is installed: `npm install <module-name>`',
          'Verify the import path is correct',
          'Ensure the file exists at the specified path',
          'Check for typos in the module name'
        ],
        examples: [
          'Wrong path: `import "./component"` → `import "./Component"`',
          'Missing extension: `import "./style"` → `import "./style.css"`'
        ],
        resources: [
          'https://nodejs.org/api/modules.html'
        ]
      },
      
      // Runtime Errors
      'Cannot read property': {
        title: 'Runtime Error - Property Access',
        steps: [
          'Check if the object is defined before accessing properties',
          'Use optional chaining: `object?.property`',
          'Add proper null/undefined checks',
          'Initialize variables with default values'
        ],
        examples: [
          'Unsafe access: `user.name` → `user?.name`',
          'With fallback: `user?.name || "Unknown"`'
        ],
        resources: [
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining'
        ]
      },
      
      // Default guidance
      'default': {
        title: 'General Error Resolution',
        steps: [
          'Read the error message carefully',
          'Check the file and line number mentioned',
          'Look for recent changes in the affected file',
          'Search for similar errors online'
        ],
        examples: [
          'Use console.log to debug variable values',
          'Check browser developer tools for additional details'
        ],
        resources: [
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors'
        ]
      }
    };

    // Find matching guidance based on error message
    const matchingKey = Object.keys(guidance).find(key => 
      error.message.toLowerCase().includes(key.toLowerCase())
    );
    
    return guidance[matchingKey as keyof typeof guidance] || guidance.default;
  };

  const getCategorySpecificTips = (category: string) => {
    const categoryTips = {
      syntax: [
        'Use a code formatter like Prettier to catch syntax issues',
        'Enable ESLint for real-time syntax checking',
        'Use an IDE with syntax highlighting'
      ],
      type: [
        'Enable strict TypeScript settings',
        'Use type assertions carefully',
        'Consider using type guards for complex types'
      ],
      import: [
        'Use absolute imports with path mapping',
        'Check your tsconfig.json paths configuration',
        'Verify package.json dependencies'
      ],
      runtime: [
        'Add proper error boundaries in React',
        'Use try-catch blocks for error handling',
        'Implement proper loading states'
      ],
      security: [
        'Sanitize user inputs',
        'Use HTTPS for all external requests',
        'Validate data on both client and server'
      ]
    };

    return categoryTips[category as keyof typeof categoryTips] || [];
  };

  const guidance = getErrorGuidance(error);
  const categoryTips = getCategorySpecificTips(error.category);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {guidance.title}
          </CardTitle>
          <CardDescription>
            Step-by-step guidance to resolve this error
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="steps" className="space-y-3">
              <div className="space-y-2">
                {guidance.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-3">
              <div className="space-y-3">
                {guidance.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Code className="h-4 w-4 mt-0.5 text-gray-500" />
                      <code className="text-sm font-mono">{example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tips" className="space-y-3">
              <div className="space-y-2">
                {categoryTips.map((tip, index) => (
                  <Alert key={index}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{tip}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-3">
              <div className="space-y-2">
                {guidance.resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-500" />
                    <a
                      href={resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {resource}
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Open File
            </Button>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              View Source
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Search Online
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ErrorGuidance };
