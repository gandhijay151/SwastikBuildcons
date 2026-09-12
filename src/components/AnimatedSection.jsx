import { motion } from 'framer-motion';

export default function AnimatedSection({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      className={`scroll-mt-20 ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      // amount:0 + a negative bottom margin reveals a section as soon as its top
      // edge nears the viewport. The old 0.18 threshold left tall sections stuck
      // at opacity:0 on narrow screens, showing up as large blank gaps.
      viewport={{ once: true, amount: 0, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
