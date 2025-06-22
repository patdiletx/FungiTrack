import { config } from 'dotenv';
config();

import '@/ai/flows/upsell-strategy.ts';
import '@/ai/flows/batch-assistant-flow.ts';
import '@/ai/flows/diagnose-contamination-flow.ts';
import '@/ai/flows/generate-product-image-flow.ts';
import '@/ai/flows/myco-mind-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
