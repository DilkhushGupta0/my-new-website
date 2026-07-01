import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'candidate' | 'hr' | 'admin';
  resume?: string;
  phone?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'hr', 'admin'], required: true },
    resume: String,
    phone: String,
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  tags: string[];
  postedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    tags: [String],
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  resumeUrl: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  isPremium: boolean;
  createdAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending' },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
