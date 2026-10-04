import { Stack, Stepper, Steps, type ProgressDotInfo, type StepsProps } from '@rottay/design-system';
import { Steps as AntSteps } from 'antd';

const shared: StepsProps = { items: [], initial: 1 };
const dot = (info: ProgressDotInfo) => info.index;

export function Journey({ step, setStep }: { step: number; setStep: (next: number) => void }) {
  return (
    <Stack>
      <Steps items={[]} current={step} />
      <Steps items={[]} initial={2} size="small" />
      <Steps items={[]} type="navigation" size="default" />
      <Steps items={[]} current={step} onChange={setStep} />
      <Steps items={[]} progressDot={dot} />
      <Steps {...shared} />
      <Stepper items={[]} current={step} clickable onChange={setStep} />
      <AntSteps initial={1} type="navigation" items={[]} />
    </Stack>
  );
}
