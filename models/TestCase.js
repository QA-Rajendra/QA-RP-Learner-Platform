import mongoose from 'mongoose';

const TestStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, default: 1 },
  action: { type: String, required: true },
  testData: { type: String, default: '' },
  expectedResult: { type: String, required: true },
  actualResult: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Not Run', 'Passed', 'Failed', 'Blocked', 'Skipped'],
    default: 'Not Run',
  },
});

const TestCaseSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      default: 'General',
    },
    scenarioId: {
      type: String,
      trim: true,
      default: '',
    },
    testCaseId: {
      type: String,
      required: [true, 'Test Case ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Test Case Name is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    type: {
      type: String,
      enum: ['Positive', 'Negative', 'Boundary', 'Edge Case', 'Security', 'Performance', 'End-to-End'],
      default: 'Positive',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      enum: ['table', 'excel', 'csv', 'plain_text', 'structured'],
      default: 'structured',
    },
    steps: [TestStepSchema],
    preconditions: {
      type: String,
      default: '',
    },
    postconditions: {
      type: String,
      default: '',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PortfolioProject',
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Ready', 'In Review', 'Automated', 'Passed', 'Failed'],
      default: 'Ready',
    },
    author: {
      type: String,
      default: 'QA RP Team',
    },
    executionTime: {
      type: String,
      default: '2 mins',
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

TestCaseSchema.index({ module: 1, priority: 1, type: 1 });

export default mongoose.models.TestCase || mongoose.model('TestCase', TestCaseSchema);
