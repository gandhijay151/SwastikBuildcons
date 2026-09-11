import { motion } from 'framer-motion';

export default function AnimatedSection({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      className={`scroll-mt-20 ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
