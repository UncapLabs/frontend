import { Button } from "~/components/ui/button";
import { Container } from "./container";
import { Gradient } from "./gradient";
import { Subheading } from "./text";

function CTAs() {
  return (
    <div className="relative pt-20 pb-16 text-center sm:py-24">
      <hgroup>
        <Subheading>Get started</Subheading>
        <p className="mt-6 text-3xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Ready to dive in?
          <br />
          Start your free trial today.
        </p>
      </hgroup>
      <p className="mx-auto mt-6 max-w-xs text-sm/6 text-gray-500">
        Get the cheat codes for selling and unlock your team&apos;s revenue
        potential.
      </p>
      <div className="mt-6">
        <Button className="w-full sm:w-auto">Get started</Button>
      </div>
    </div>
  );
}

export function CallToAction() {
  return (
    <>
      <Gradient className="relative">
        <div className="absolute inset-2 rounded-4xl bg-white/80" />
        <Container>
          <CTAs />
        </Container>
      </Gradient>
    </>
  );
}
