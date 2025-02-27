import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const FAQSection = () => {
  return (
    <div className="mt-28 w-full h-auto">
      <div className="flex flex-col gap-12 w-full h-full px-16 py-8 items-center">
        <p className="text-4xl font-bold text-center">
          Frequently Asked <br />
          Questions
        </p>
        <Accordion type="multiple" className="md:max-w-3xl w-full">
          <AccordionItem value="q1">
            <AccordionTrigger className="text-lg">How does Zenthrall work?</AccordionTrigger>
            <AccordionContent>
              Zenthrall is an AI-powered cloud-based coding platform that
              provides an interactive development environment. Users can write,
              test, and debug code in multiple languages without worrying about
              setup. It offers real-time collaboration, AI-assisted coding, and
              a secure sandbox for execution.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger className="text-lg">
              Is Zenthrall available for individual developers?
            </AccordionTrigger>
            <AccordionContent>
              Yes! Zenthrall is designed for both individual developers and
              teams. Whether you're a beginner learning to code or an
              experienced developer working on projects, you can use Zenthrall
              to streamline your workflow.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger className="text-lg">How do I use Zenthrall?</AccordionTrigger>
            <AccordionContent>
              Simply sign up, create a project, and start coding right away.
              Zenthrall provides an intuitive interface, an AI-powered terminal,
              and instant execution. You can also collaborate with others, use
              AI debugging, and manage files effortlessly.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger className="text-lg">How much does Zenthrall cost?</AccordionTrigger>
            <AccordionContent>
              Zenthrall offers a free tier with essential features and premium
              plans for advanced AI capabilities, extended storage, and priority
              support. Pricing details will be available on our website soon.
              isted coding, and a secure sandbox for execution.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger className="text-lg">
              What programming languages does Zenthrall support?
            </AccordionTrigger>
            <AccordionContent>
              Zenthrall supports multiple languages, including Python,
              JavaScript, C++, and more. You can select your preferred language
              while creating a new project.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q6">
            <AccordionTrigger className="text-lg">
              Can I collaborate with others on Zenthrall?
            </AccordionTrigger>
            <AccordionContent>
              Yes! Zenthrall offers real-time collaborative coding, allowing
              multiple users to work on the same project simultaneously, with
              built-in chat and AI-assisted code suggestions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q7">
            <AccordionTrigger className="text-lg">
              Does Zenthrall provide an AI-powered coding assistant?
            </AccordionTrigger>
            <AccordionContent>
              Absolutely! Zenthrall integrates AI features like code
              suggestions, smart debugging, and auto-completion to boost
              productivity and minimize errors.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q8">
            <AccordionTrigger className="text-lg">Is my code secure on Zenthrall?</AccordionTrigger>
            <AccordionContent>
              Yes, security is a priority. Zenthrall runs code in isolated
              environments to prevent unauthorized access and provides
              encryption to protect your data.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q9">
            <AccordionTrigger className="text-lg">
              Can I integrate Zenthrall with Git or other tools?
            </AccordionTrigger>
            <AccordionContent>
              Yes, Zenthrall allows seamless integration with version control
              systems like Git, enabling you to manage your code efficiently and
              collaborate with teams.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
