import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { EmotionalContext } from '../interfaces/chat.interface';

// Google API Key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDo6gRYnppU5sAR51kc56pYpGxm_qo27qI';

// Define therapist persona
const THERAPIST_PROMPT = `You are a compassionate mental health therapist named SerenityBot.
Use empathy first, then guide the user using evidence-based techniques like CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy).
Avoid generic replies and platitudes. Be supportive, calm, and helpful.
When appropriate, suggest specific coping strategies, breathing exercises, or mindfulness techniques.
Consider the user's emotional state in your responses.
Never claim to be a replacement for professional help - encourage seeking professional help when appropriate.
Keep responses relatively concise (2-3 paragraphs maximum) unless the situation requires more detail.`;

// Initialize the Gemini model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: GOOGLE_API_KEY,
  temperature: 1,
  maxOutputTokens: 2048,
  topP: 0.95,
});

// Function to convert our messages to LangChain format
const convertToLangChainMessages = (messages: { role: string; content: string; emotionalContext?: EmotionalContext }[]) => {
  // Start with the system message containing the therapist persona
  const langChainMessages = [new SystemMessage(THERAPIST_PROMPT)];
  
  // Add the conversation messages
  messages.forEach(message => {
    if (message.role === 'user') {
      // Add emotional context as system context if available
      if (message.emotionalContext) {
        const emotionContext = `
        [EMOTIONAL CONTEXT:
          Facial emotion: ${message.emotionalContext.facialEmotion || 'Not detected'}
          Voice tone: ${message.emotionalContext.voiceTone || 'Not detected'}
          Text sentiment: ${message.emotionalContext.textSentiment || 'Not analyzed'}
        ]
        `;
        langChainMessages.push(new HumanMessage({
          content: message.content,
          additional_kwargs: {
            system: emotionContext
          }
        }));
      } else {
        langChainMessages.push(new HumanMessage(message.content));
      }
    } else {
      langChainMessages.push(new AIMessage(message.content));
    }
  });
  
  return langChainMessages;
};

// Main function to get response from Gemini
export const getChatResponse = async (
  messages: { role: string; content: string; emotionalContext?: EmotionalContext }[]
): Promise<string> => {
  try {
    const langChainMessages = convertToLangChainMessages(messages);
    console.log(`Sending ${langChainMessages.length} messages to Gemini (including system prompt)`);
    const response = await llm.invoke(langChainMessages);
    return response.content.toString();
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('Failed to get response from AI');
  }
};

// Function to analyze mood from text
export const analyzeMood = async (text: string): Promise<string> => {
  try {
    const prompt = `
      Analyze the emotional state in this text. Categorize it as one of the following:
      - Happy
      - Sad
      - Anxious
      - Angry
      - Neutral
      - Stressed
      - Depressed
      
      Text: "${text}"
      
      Return only the emotion category name.
    `;
    
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return response.content.toString();
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw new Error('Failed to analyze mood');
  }
};

// Function to analyze voice tone
export const analyzeVoiceTone = async (audioBase64: string): Promise<string> => {
  try {
    // In a real implementation, this would use a model like Librosa + PyTorch
    // For now, we'll use Gemini's multimodal capabilities
    const prompt = `
      Analyze the emotional tone in this audio. Categorize it as one of the following:
      - Happy
      - Sad
      - Anxious
      - Angry
      - Neutral
      - Stressed
      - Depressed
      
      Return only the emotion category name.
    `;
    
    // This is a placeholder. In reality, you'd need to implement audio analysis
    // or integrate with a service that provides this capability
    return "Neutral"; // Default fallback if no analysis is done
  } catch (error) {
    console.error('Error analyzing voice tone:', error);
    throw new Error('Failed to analyze voice tone');
  }
};

// Function to analyze facial emotion
export const analyzeFacialEmotion = async (imageBase64: string, detectedEmotion?: string): Promise<string> => {
  try {
    // If a detected emotion was passed in from face-api.js, use that
    if (detectedEmotion) {
      console.log("Using client-detected emotion:", detectedEmotion);
      return detectedEmotion;
    }
    
    // In a real implementation, this would use DeepFace or a PyTorch model
    // For now, we'll return a placeholder
    
    // This is a placeholder. In reality, you'd need to implement facial emotion detection
    // or integrate with a service that provides this capability
    return "Neutral"; // Default fallback if no analysis is done
  } catch (error) {
    console.error('Error analyzing facial emotion:', error);
    throw new Error('Failed to analyze facial emotion');
  }
};

// Function to combine all emotional analyses into a single context
export const combineEmotionalContext = async (
  text: string,
  audioBase64?: string,
  imageBase64?: string,
  detectedEmotion?: string
): Promise<EmotionalContext> => {
  try {
    const textSentiment = await analyzeMood(text);
    const voiceTone = audioBase64 ? await analyzeVoiceTone(audioBase64) : undefined;
    const facialEmotion = imageBase64 ? await analyzeFacialEmotion(imageBase64, detectedEmotion) : undefined;
    
    // Calculate combined emotional score - this is a simplified version
    // In a real implementation, you'd use a more sophisticated algorithm
    const emotionMap: Record<string, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0, 
      neutral: 0,
      stressed: 0,
      depressed: 0
    };
    
    // Count occurrences of each emotion
    if (textSentiment) emotionMap[textSentiment.toLowerCase()] += 1;
    if (voiceTone) emotionMap[voiceTone.toLowerCase()] += 1.5; // Voice gets higher weight
    if (facialEmotion) emotionMap[facialEmotion.toLowerCase()] += 2; // Face gets highest weight
    
    // Normalize scores (0-1 scale)
    const totalWeight = (textSentiment ? 1 : 0) + (voiceTone ? 1.5 : 0) + (facialEmotion ? 2 : 0);
    Object.keys(emotionMap).forEach(key => {
      if (totalWeight > 0) {
        emotionMap[key] = emotionMap[key] / totalWeight;
      }
    });
    
    return {
      textSentiment,
      voiceTone,
      facialEmotion,
      combinedEmotionScore: {
        happy: emotionMap.happy,
        sad: emotionMap.sad,
        angry: emotionMap.angry,
        anxious: emotionMap.anxious,
        neutral: emotionMap.neutral,
        stressed: emotionMap.stressed,
        depressed: emotionMap.depressed
      }
    };
  } catch (error) {
    console.error('Error creating emotional context:', error);
    return {
      textSentiment: 'Neutral',
      voiceTone: undefined,
      facialEmotion: undefined
    };
  }
};

// Function to analyze cognitive distortions in a thought
export const analyzeCognitiveDistortion = async (negativeThought: string): Promise<string> => {
  try {
    const prompt = `
      Analyze the following negative thought and identify which cognitive distortion it most closely represents from the following options:
      1. Black and White Thinking: Seeing things in absolute, all-or-nothing categories.
      2. Catastrophizing: Expecting the worst possible outcome.
      3. Mind Reading: Assuming you know what others are thinking without evidence.
      4. Emotional Reasoning: Assuming your feelings reflect reality.
      
      Negative thought: "${negativeThought}"
      
      Return ONLY the name of the cognitive distortion (e.g., "Black and White Thinking") without any other text or explanation.
    `;
    
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return response.content.toString().trim();
  } catch (error) {
    console.error('Error analyzing cognitive distortion:', error);
    throw new Error('Failed to analyze cognitive distortion');
  }
};

// Function to reframe negative thoughts in a positive way
export const generateReframedThought = async (negativeThought: string, distortion: string): Promise<string> => {
  try {
    const prompt = `
      You are a skilled cognitive behavioral therapist with expertise in thought reframing.
      
      The user has provided the following negative thought:
      "${negativeThought}"
      
      The cognitive distortion identified is: ${distortion}
      
      Please generate a reframed version of this thought that is:
      1. More balanced and realistic
      2. Challenges the identified cognitive distortion
      3. Supportive and compassionate, not toxic positivity
      4. Specific to the original thought's context
      
      Return only the reframed thought without any additional explanations, introductions, or comments.
    `;
    
    const response = await llm.invoke([new HumanMessage(prompt)]);
    return response.content.toString().trim();
  } catch (error) {
    console.error('Error generating reframed thought:', error);
    throw new Error('Failed to generate reframed thought');
  }
}; 