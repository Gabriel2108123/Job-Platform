import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreHireChecksConfirmModal } from '../PreHireChecksConfirmModal';

describe('PreHireChecksConfirmModal', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        expect(screen.getByText('Confirm Pre-Hire Checks')).toBeInTheDocument();
        expect(screen.getByText(/Right-to-work checks completed/)).toBeInTheDocument();
    });

    it('confirm button is disabled by default', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        const confirmButton = screen.getByText('Confirm & Hire');
        expect(confirmButton).toBeDisabled();
    });

    it('confirm button remains disabled if only checkbox is checked', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        const confirmButton = screen.getByText('Confirm & Hire');
        expect(confirmButton).toBeDisabled();
    });

    it('confirm button remains disabled if text is too short', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        const textarea = screen.getByLabelText(/Details/);
        fireEvent.change(textarea, { target: { value: 'Too short' } });
        const confirmButton = screen.getByText('Confirm & Hire');
        expect(confirmButton).toBeDisabled();
        expect(screen.getByText(/at least 20 characters/)).toBeInTheDocument();
    });

    it('calls onConfirm with correct payload when valid', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        const textarea = screen.getByLabelText(/Details/);
        const validText = 'This is a long enough text for the pre-hire check verification.';
        fireEvent.change(textarea, { target: { value: validText } });

        const confirmButton = screen.getByText('Confirm & Hire');
        expect(confirmButton).not.toBeDisabled();
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledWith({
            preHireConfirmation: true,
            preHireConfirmationText: validText
        });
    });

    it('calls onClose when cancel is clicked', () => {
        render(<PreHireChecksConfirmModal open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
