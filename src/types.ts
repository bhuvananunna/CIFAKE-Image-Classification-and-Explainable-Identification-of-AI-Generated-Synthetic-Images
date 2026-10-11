/**
 * CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
 * Core TypeScript Interfaces & Types
 */

export type ModelType = 'cnn2d' | 'modified_cnn2d';
export type PredictionLabel = 'REAL' | 'FAKE';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface PredictionRecord {
  id: string;
  userId: string;
  imageName: string;
  originalImage: string; // Base64 or ObjectURL
  gradcamOverlay: string; // Base64
  heatmapOnly: string; // Base64
  modelType: ModelType;
  prediction: PredictionLabel;
  confidence: number; // 0 to 100
  realProbability: number;
  fakeProbability: number;
  inferenceTimeMs: number;
  timestamp: string;
}

export interface EpochLog {
  epoch: number;
  loss: number;
  valLoss: number;
  accuracy: number;
  valAccuracy: number;
}

export interface ModelMetrics {
  modelType: ModelType;
  modelName: string;
  isTrained: boolean;
  totalParameters: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tn: number; // True Real
    fp: number; // False Fake
    fn: number; // False Real
    tp: number; // True Fake
  };
  history: EpochLog[];
  lastTrainedAt?: string;
}

export interface TestCaseResult {
  id: number;
  name: string;
  inputDescription: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  executionTimeMs?: number;
}

export interface ProjectConfig {
  datasetPath: string;
  imageSize: [number, number];
  batchSize: number;
  epochs: number;
  learningRate: number;
  modelPath: string;
}

export interface SampleImage {
  id: string;
  name: string;
  category: string;
  label: PredictionLabel;
  description: string;
  dataUrl: string;
}
