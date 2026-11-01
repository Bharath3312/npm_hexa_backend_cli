
import { model, Schema } from 'mongoose';

   const refreshTokenSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        revoked: { type: Boolean, default: false },

        ip: { type: String, required: true },
        userAgent: { type: String, required: true },

        device: {
        browser: { type: String },
        os: { type: String },
        deviceType: { type: String }, // 'desktop' | 'mobile' | 'tablet'
        },

        lastUsedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
    );

export const AuthSession = model('sessions', refreshTokenSchema);
