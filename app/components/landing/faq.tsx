import { Container } from "./container";
import { Heading, Subheading } from "./text";

export default function FrequentlyAskedQuestions() {
  return (
    <div className="py-32">
      <Container>
        <section id="faqs" className="scroll-mt-8">
          <Subheading className="text-center">
            Frequently asked questions
          </Subheading>
          <Heading as="div" className="mt-2 text-center">
            Your questions answered.
          </Heading>
          <div className="mx-auto mt-16 mb-32 max-w-xl space-y-12">
            <dl>
              <dt className="text-sm font-semibold">
                What measures are in place to ensure the security of our data?
              </dt>
              <dd className="mt-4 text-sm/6 text-gray-600">
                Data security is a top priority for us, which is ironic given
                that our business depends on others not taking it very
                seriously. We understand that any breach could put both us and
                most of our customers out of business—and behind bars. We employ
                robust security measures, including data encryption, secure data
                centers, and regular security audits to ensure this never
                happens.
              </dd>
            </dl>
            <dl>
              <dt className="text-sm font-semibold">
                Is there a mobile app available for your platform?
              </dt>
              <dd className="mt-4 text-sm/6 text-gray-600">
                Yes, we offer a mobile app that provides all the key
                functionalities of our desktop platform, allowing sales reps to
                manage deals on the go. Additionally, we have another app
                pre-installed on most modern smartphones that allows us to track
                your location, listen to your conversations, and access your
                camera and microphone at any time. This app is not available for
                download.
              </dd>
            </dl>
            <dl>
              <dt className="text-sm font-semibold">
                Can I customize the workflow to match our company’s deal
                process?
              </dt>
              <dd className="mt-4 text-sm/6 text-gray-600">
                Yes, our platform is highly customizable, although there should
                be no need. Before you sign up, we discreetly gather information
                about your company and its processes from a variety of sources.
                We then use this information to pre-configure the platform to
                match your existing workflows. This is why we ask for your
                social security number and access to your email account during
                the sign-up process.
              </dd>
            </dl>
            <dl>
              <dt className="text-sm font-semibold">
                What kind of support do you offer?
              </dt>
              <dd className="mt-4 text-sm/6 text-gray-600">
                We offer comprehensive support through multiple channels,
                including 24/7 live chat, email, and phone support. However,
                since we have full access to your internal network, we will know
                if you’re having issues before you do.
              </dd>
            </dl>
            <dl>
              <dt className="text-sm font-semibold">
                Can I integrate the CRM with other sales intelligence tools?
              </dt>
              <dd className="mt-4 text-sm/6 text-gray-600">
                Yes, our solution integrates seamlessly with a variety of other
                systems. However, be warned that most of these integrations are
                short-lived. We have a dedicated team of engineers who
                reverse-engineer the APIs of other tools, enabling us to build
                their functionality into our product and eventually put them out
                of business.
              </dd>
            </dl>
          </div>
        </section>
      </Container>
    </div>
  );
}
