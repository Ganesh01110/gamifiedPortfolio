import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from '../actions/sendEmail';
import { Resend } from 'resend';

// Mock Resend
vi.mock('resend', () => {
    return {
        Resend: vi.fn().mockImplementation(function () {
            return {
                emails: {
                    send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
                },
            };
        }),
    };
});

describe('sendEmail Server Action', () => {
    it('should fail validation with empty fields', async () => {
        const formData = new FormData();
        const result = await sendEmail(null, formData);

        expect(result.success).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.message).toContain('Missing Fields');
    });

    it('should enter simulation mode when API key is missing', async () => {
        const originalKey = process.env.RESEND_API_KEY;
        delete process.env.RESEND_API_KEY;

        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('email', 'test@example.com');
        formData.append('message', 'This is a long enough message for validation.');

        const result = await sendEmail(null, formData);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Simulation');

        process.env.RESEND_API_KEY = originalKey;
    });

    it('should attempt real send when API key is present', async () => {
        process.env.RESEND_API_KEY = 're_test_123';

        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('email', 'test@example.com');
        formData.append('message', 'This is a long enough message for validation.');

        const result = await sendEmail(null, formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Email sent successfully!');
    });
});
