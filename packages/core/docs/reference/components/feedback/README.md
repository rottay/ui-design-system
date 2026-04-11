# Feedback Primitives

UI components for providing feedback to users through alerts, loading indicators, and progress displays.

## Overview

The Feedback primitives provide three essential components for user feedback:

1. **Alert** - Display contextual feedback messages
2. **Spinner** - Show loading states
3. **Progress** - Visualize operation progress

All components support three rendering engines:
- **Titan** (Ant Design) - Enterprise-grade components
- **Hermes** (DaisyUI) - Lightweight Tailwind-based components
- **Apollo** (Pure CSS) - Zero-dependency implementations

## Installation

```bash
npm install @rottay/design-system
```

## Basic Usage

```tsx
import { Alert, Spinner, Progress } from '@rottay/design-system';

function App() {
  return (
    <div>
      <Alert type="info" message="Welcome!" />
      <Spinner size="lg" label="Loading..." />
      <Progress percent={75} />
    </div>
  );
}
```

## Components

### Alert

Display contextual feedback messages with different severity levels.

#### Examples

```tsx
// Basic info alert
<Alert type="info" message="This is an information message" />

// Success alert
<Alert type="success" message="Operation completed successfully!" />

// Warning with description
<Alert 
  type="warning"
  message="Warning"
  description="This action cannot be undone"
/>

// Closable error alert
<Alert 
  type="error"
  message="Error occurred"
  description="Please try again later"
  closable
  onClose={() => console.log('Alert closed')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Alert severity type |
| `message` | `ReactNode` | required | Main alert message |
| `description` | `ReactNode` | - | Optional detailed description |
| `icon` | `ReactNode` | - | Custom icon (overrides default) |
| `showIcon` | `boolean` | `true` | Whether to show icon |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | - | Callback when alert is closed |

### Spinner

Loading indicator with customizable size and appearance.

#### Examples

```tsx
// Basic spinner
<Spinner />

// Large spinner with label
<Spinner size="lg" label="Loading data..." />

// Small spinner
<Spinner size="sm" />

// Custom color (Apollo engine only)
<Spinner color="#ff4d4f" size="md" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Spinner size |
| `color` | `string` | `'#1890ff'` | Spinner color (Apollo only) |
| `label` | `string` | - | Optional loading text |

#### Size Reference
- `sm`: 16px
- `md`: 24px (default)
- `lg`: 32px
- `xl`: 48px

### Progress

Visualize the progress of an operation.

#### Examples

```tsx
// Basic line progress
<Progress percent={75} />

// Circle progress
<Progress percent={100} type="circle" status="success" />

// Custom color
<Progress percent={50} strokeColor="#52c41a" />

// Active state with animation
<Progress percent={60} status="active" />

// Without percentage display
<Progress percent={80} showInfo={false} />

// Custom stroke width
<Progress percent={90} strokeWidth={12} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `percent` | `number` | required | Progress percentage (0-100) |
| `type` | `'line' \| 'circle'` | `'line'` | Progress bar type |
| `status` | `'normal' \| 'success' \| 'error' \| 'active'` | `'normal'` | Progress status |
| `showInfo` | `boolean` | `true` | Show percentage text |
| `strokeColor` | `string` | - | Custom progress color |
| `strokeWidth` | `number` | `8` | Progress bar thickness |

## Engine Comparison

### Classic (Ant Design)

**Best for:** Enterprise applications, admin dashboards

```tsx
import { EngineProvider } from '@rottay/design-system';

<EngineProvider engine="classic">
  <Alert type="success" message="Using Ant Design" />
</EngineProvider>
```

**Characteristics:**
- Rich feature set
- Comprehensive theming
- Built-in accessibility
- ~300KB bundle impact

### Modern (DaisyUI)

**Best for:** Modern web apps, Tailwind projects

```tsx
import { EngineProvider } from '@rottay/design-system';

<EngineProvider engine="modern">
  <Alert type="success" message="Using DaisyUI" />
</EngineProvider>
```

**Characteristics:**
- Tailwind CSS based
- 30+ theme variants
- Lightweight (~50KB)
- Rapid development

### Rustic (Pure CSS)

**Best for:** Performance-critical apps, zero dependencies

```tsx
import { EngineProvider } from '@rottay/design-system';

<EngineProvider engine="rustic">
  <Alert type="success" message="Using Pure CSS" />
</EngineProvider>
```

**Characteristics:**
- No external dependencies
- Full customization
- Minimal bundle (~2KB)
- Maximum performance

## Common Patterns

### Loading State

```tsx
function DataLoader() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spinner size="lg" label="Loading data..." />;
  }

  return <DataDisplay data={data} />;
}
```

### Form Validation

```tsx
function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values) => {
    try {
      await login(values);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && (
        <Alert 
          type="error"
          message="Login Failed"
          description={error}
          closable
          onClose={() => setError(null)}
        />
      )}
      <Form onSubmit={handleSubmit} />
    </div>
  );
}
```

### File Upload Progress

```tsx
function FileUploader() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    const upload = createUpload(file);
    
    upload.onProgress((percent) => {
      setProgress(percent);
    });

    await upload.start();
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {progress > 0 && (
        <Progress 
          percent={progress}
          status={progress === 100 ? 'success' : 'active'}
        />
      )}
    </div>
  );
}
```

### Multi-Step Form

```tsx
function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>
      <Progress 
        percent={progress}
        strokeColor={progress === 100 ? '#52c41a' : undefined}
      />
      <StepContent step={currentStep} />
      <Button onClick={() => setCurrentStep(currentStep + 1)}>
        Next
      </Button>
    </div>
  );
}
```

## TypeScript

All components are fully typed:

```typescript
import type { 
  AlertProps, 
  AlertType,
  SpinnerProps, 
  SpinnerSize,
  ProgressProps, 
  ProgressType, 
  ProgressStatus 
} from '@rottay/design-system';

const alertType: AlertType = 'success';
const spinnerSize: SpinnerSize = 'lg';
const progressStatus: ProgressStatus = 'active';
```

## Styling

All components accept `className` and `style` props for customization:

```tsx
<Alert 
  type="info"
  message="Custom styled"
  className="my-custom-alert"
  style={{ borderRadius: '8px', fontWeight: 'bold' }}
/>
```

## Accessibility

All feedback components support:
- ✅ Screen reader announcements
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Focus management

## Best Practices

1. **Use appropriate severity levels**
   - `info` - General information
   - `success` - Successful operations
   - `warning` - Potential issues
   - `error` - Failed operations

2. **Provide meaningful messages**
   ```tsx
   // ❌ Bad
   <Alert type="error" message="Error" />
   
   // ✅ Good
   <Alert 
     type="error" 
     message="Failed to save changes"
     description="Please check your internet connection and try again"
   />
   ```

3. **Use progress for long operations**
   ```tsx
   // ❌ Bad - No feedback
   await longOperation();
   
   // ✅ Good - Show progress
   <Progress percent={operationProgress} status="active" />
   ```

4. **Make non-critical alerts dismissible**
   ```tsx
   <Alert 
     type="info"
     message="New features available"
     closable
   />
   ```

5. **Combine components for better UX**
   ```tsx
   function AsyncOperation() {
     const [loading, setLoading] = useState(false);
     const [success, setSuccess] = useState(false);
     const [error, setError] = useState(null);

     if (loading) return <Spinner label="Processing..." />;
     if (error) return <Alert type="error" message={error} />;
     if (success) return <Alert type="success" message="Complete!" />;
     
     return <ActionButton onClick={handleAction} />;
   }
   ```

## License

MIT
