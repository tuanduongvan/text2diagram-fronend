import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload, Zap } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { useState } from 'react';

export function LandingPage() {
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Thank you for your feedback.');
  };
  const handleNavigateToPrompt = () => {
    navigate('/login', { state: { to: '/prompt' } });
  };

  const sendEmail = () => {
    if (!userEmail && !feedback) {
      toast.error('Email and feedback can not be empty.');
      return;
    }
    if (!userEmail) {
      toast.error('Please enter your email.');
      return;
    }
    if (!feedback) {
      toast.error('Please enter your feedback.');
      return;
    }

    const templateParams = {
      from_name: userEmail,
      message: feedback,
      reply_to: userEmail
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        function (response) {
          console.log('SUCCESS!', response.status, response.text);
          setFeedback('');
          setUserEmail('');
        },
        function (error) {
          console.log('FAILED...', error);
          alert('Error. Try again.');
          setFeedback('');
          setUserEmail('');
        }
      );
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <section className="text-center py-20 px-6 md:px-12 lg:px-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold"
        >
          ✨ Turn text into visual diagrams in seconds!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300"
        >
          Enter text or upload files - AI will automatically generate UML
          diagrams, flowcharts, and more!
        </motion.p>
        <motion.div
          className="mt-6 flex flex-col md:flex-row gap-4 justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={handleNavigateToPrompt}
            className="px-6 py-3 text-lg"
          >
            Try it now - Free!
          </Button>
          <Button
            variant="outline"
            className="px-6 py-3 text-lg"
            onClick={() => setShowDemo(true)}
          >
            📺 Watch demo
          </Button>
        </motion.div>
      </section>

      <AnimatePresence>
        {showDemo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDemo(false)}
          >
            <div className="relative">
              <button
                className="hidden lg:block absolute -top-6 cursor-pointer -right-8 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDemo(false);
                }}
              >
                <X size={24} />
              </button>
              <iframe
                className="w-[360px] h-[280px] sm:w-[540px] sm:h-[320px] md:w-[700px] md:h-[450px] lg:w-[800px]"
                src="https://www.youtube.com/embed/abPmZCZZrFA?si=SOi6ZA7nQwCjpskQ" //temporarily leave this link, will change to official link later
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="py-16 px-6 md:px-12 lg:px-20 grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="p-6 shadow-lg">
              <CardContent className="flex flex-col items-center text-center">
                <feature.icon size={48} className="text-blue-500" />
                <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="bg-gray-200 dark:bg-[#1F1F1F] py-16 px-6 md:px-12 lg:px-20 text-center">
        <motion.h2 className="text-3xl font-bold">How it works</motion.h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-6 bg-white dark:bg-[#2A2A2A] border-[1px] dark:border-[#CCCCCC] rounded-md border-[#555555] shadow-md"
            >
              <h3 className="text-xl font-semibold dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold"
        >
          🚀 Get started today!
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-col md:flex-row gap-4 justify-center"
        >
          <Button className="px-6 py-3 text-lg">Try it for free</Button>
          <Button variant="outline" className="px-6 py-3 text-lg">
            Watch demo
          </Button>
        </motion.div>
      </section>

      <div className="flex items-center md:items-start justify-evenly gap-4 px-4 flex-col md:flex-row w-full">
        <motion.section
          className="py-16 px-6 md:px-12 lg:px-20 bg-gray-50 dark:bg-[#0A0A0A] rounded-[4px] md:w-1/2 w-full"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ minHeight: '500px' }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            We Value Your Feedback
          </h2>
          <form onSubmit={handleFeedbackSubmit} className="max-w-xl mx-auto">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-2 font-medium dark:text-white"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full p-[10px] border rounded dark:bg-[#1F1F1F] dark:border-[#444]"
                placeholder="Your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="block mb-2 font-medium dark:text-white"
              >
                Your Feedback
              </label>
              <textarea
                id="message"
                required
                rows={4}
                className="w-full p-3 border rounded dark:bg-[#1F1F1F] dark:border-[#444] resize-none"
                placeholder="Your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="text-center">
              <Button
                type="submit"
                className="px-6 py-3 text-lg"
                onClick={sendEmail}
              >
                Send Feedback
              </Button>
            </div>
          </form>
        </motion.section>

        <motion.section
          className="py-16 px-6 md:px-12 lg:px-20 bg-white rounded-[4px] dark:bg-[#0A0A0A] md:w-1/2 w-full"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ minHeight: '500px' }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-[20px]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Smart Conversion',
    description: 'Supports UML Diagram, Flowchart, Use Case Diagram and more.',
    icon: Zap
  },
  {
    title: 'Diverse file recognition',
    description:
      'Support input file types such as PDF, DOCX, JSON, Code import.',
    icon: FileText
  },
  {
    title: 'Fast and accurate',
    description: 'AI automatically analyzes and creates accurate diagrams.',
    icon: Upload
  }
];

const steps = [
  {
    title: 'Step 1',
    description: 'Enter a text description or upload a file.'
  },
  {
    title: 'Step 2',
    description: 'AI analyzes & generates diagrams automatically.'
  },
  { title: 'Step 3', description: 'Edit (if needed) and download the diagram.' }
];

const faqItems = [
  {
    question: 'How does the AI generate diagrams?',
    answer:
      'Our AI analyzes your text or files and uses advanced algorithms to create visual representations of your data.'
  },
  {
    question: 'What types of diagrams can I create?',
    answer: 'You can create UML diagrams, flowcharts, ER diagrams, and more.'
  },
  {
    question: 'Is there a free version available?',
    answer:
      'Yes, you can try our service for free. Additional features may require a subscription.'
  },
  {
    question: 'Can I download the diagrams?',
    answer:
      'Absolutely! You can edit and download your diagrams in various formats.'
  }
];
