import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkHistoryForm from '../WorkHistoryForm';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('WorkHistoryForm Privacy Defaults', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default privacy settings (off)', () => {
        render(<WorkHistoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Who can see this\?/i)).toHaveValue('private');
        expect(screen.getByLabelText(/Show on my Worker Map/i)).not.toBeChecked();
        expect(screen.getByLabelText(/Allow Coworker Discovery/i)).not.toBeChecked();
    });

    it('submits updated privacy values', async () => {
        render(<WorkHistoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/Employer Name \*/i), { target: { value: 'Test Corp' } });
        fireEvent.change(screen.getByLabelText(/Location \(City\/Area\) \*/i), { target: { value: 'London' } });

        // Change privacy settings
        fireEvent.change(screen.getByLabelText(/Who can see this\?/i), { target: { value: 'applied_only' } });
        fireEvent.click(screen.getByLabelText(/Show on my Worker Map/i));
        fireEvent.click(screen.getByLabelText(/Allow Coworker Discovery/i));

        fireEvent.click(screen.getByText(/Add Experience/i));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
                visibilityLevel: 'applied_only',
                isMapEnabled: true,
                allowCoworkerDiscovery: true
            }));
        });
    });

    it('initializes with provided data', () => {
        const initialData: any = {
            employerName: 'Old Corp',
            locationText: 'Paris',
            visibilityLevel: 'shortlisted_only',
            isMapEnabled: true,
            allowCoworkerDiscovery: true
        };

        render(<WorkHistoryForm initialData={initialData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Who can see this\?/i)).toHaveValue('shortlisted_only');
        expect(screen.getByLabelText(/Show on my Worker Map/i)).toBeChecked();
        expect(screen.getByLabelText(/Allow Coworker Discovery/i)).toBeChecked();
    });
});
