import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertBanner from '../AlertBanner';
import { AlertNotification } from '@/types';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock AlertService
vi.mock('@/lib/services/AlertService', () => ({
  AlertService: {
    acknowledgeAlert: vi.fn(),
  },
}));

describe('AlertBanner', () => {
  const mockAlert: AlertNotification = {
    id: 'test-alert-1',
    conditionId: 'test-condition',
    type: 'waste_rate',
    severity: 'warning',
    title: 'High Waste Rate Detected',
    message: 'Your current waste rate is 70%. You could save ¥25,000 annually.',
    actions: [
      { type: 'navigate', label: 'View Details', url: '/diagnosis/results' },
      { type: 'dismiss', label: 'Dismiss' }
    ],
    suggestedSavings: {
      monthly: 2083,
      yearly: 25000
    },
    createdAt: new Date('2024-01-15'),
    acknowledged: false,
    autoHide: false,
    priority: 7
  };

  it('renders alert banner with correct content', () => {
    render(<AlertBanner alert={mockAlert} />);

    expect(screen.getByText('High Waste Rate Detected')).toBeInTheDocument();
    expect(screen.getByText('Your current waste rate is 70%. You could save ¥25,000 annually.')).toBeInTheDocument();
  });

  it('displays savings information', () => {
    render(<AlertBanner alert={mockAlert} />);

    expect(screen.getByText(/節約可能額: 月額¥2,083/)).toBeInTheDocument();
    expect(screen.getByText(/年額¥25,000/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<AlertBanner alert={mockAlert} />);

    expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('applies correct styling for warning severity', () => {
    const { container } = render(<AlertBanner alert={mockAlert} />);

    const card = container.querySelector('.border-yellow-200');
    expect(card).toBeInTheDocument();
  });

  it('applies correct styling for critical severity', () => {
    const criticalAlert = { ...mockAlert, severity: 'critical' as const };
    const { container } = render(<AlertBanner alert={criticalAlert} />);

    const card = container.querySelector('.border-red-200');
    expect(card).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismissMock = vi.fn();
    render(<AlertBanner alert={mockAlert} onDismiss={onDismissMock} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissButton);

    expect(onDismissMock).toHaveBeenCalledWith('test-alert-1', 'dismiss');
  });

  it('hides after dismiss action', () => {
    const { container } = render(<AlertBanner alert={mockAlert} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissButton);

    // The component should be hidden (not in DOM)
    expect(container.firstChild).toBeNull();
  });

  it('renders without savings when not provided', () => {
    const alertWithoutSavings = { ...mockAlert, suggestedSavings: undefined };
    render(<AlertBanner alert={alertWithoutSavings} />);

    expect(screen.queryByText(/節約可能額/)).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<AlertBanner alert={mockAlert} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});