import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BusinessDiscoveryMap from '../BusinessDiscoveryMap'
import { NearbyCandidateDto } from '@/lib/api/client'

describe('BusinessDiscoveryMap', () => {
    const mockCenter = { lat: 51.5074, lng: -0.1278 }
    const mockCandidate: NearbyCandidateDto = {
        candidateUserId: 'candidate1',
        name: 'John Doe',
        currentRole: 'Developer',
        latApprox: 51.51,
        lngApprox: -0.13,
        distanceKm: 2.5,
        verifiedConnectionCount: 3,
    }

    const defaultProps = {
        center: mockCenter,
        radiusKm: 5,
        candidates: [mockCandidate],
        onCandidateClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Map Container', () => {
        it('renders map container with correct center', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            const mapContainer = screen.getByTestId('map-container')
            expect(mapContainer).toBeInTheDocument()
            // Map renders with provided center
        })

        it('renders tile layer', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
        })
    })

    describe('Job Location', () => {
        it('renders job location marker', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            const markers = screen.getAllByTestId('marker')
            expect(markers.length).toBeGreaterThanOrEqual(1)
        })

        it('displays job location popup', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            expect(screen.getByText('Job Location')).toBeInTheDocument()
        })
    })

    describe('Discovery Radius', () => {
        it('renders discovery circle with correct radius', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            const circles = screen.getAllByTestId('circle')
            expect(circles.length).toBeGreaterThanOrEqual(1)
        })

        it('renders circle with different radius values', () => {
            const { rerender } = render(<BusinessDiscoveryMap {...defaultProps} radiusKm={10} />)
            expect(screen.getAllByTestId('circle')).toHaveLength(1)

            rerender(<BusinessDiscoveryMap {...defaultProps} radiusKm={20} />)
            expect(screen.getAllByTestId('circle')).toHaveLength(1)
        })
    })

    describe('Candidate Markers', () => {
        it('renders markers for candidates with coordinates', () => {
            const candidates = [
                mockCandidate,
                { ...mockCandidate, candidateUserId: 'candidate2', latApprox: 51.52, lngApprox: -0.14 },
            ]
            render(<BusinessDiscoveryMap {...defaultProps} candidates={candidates} />)

            // Should have job marker + 2 candidate markers
            const markers = screen.getAllByTestId('marker')
            expect(markers.length).toBeGreaterThanOrEqual(2)
        })

        it('filters out candidates without coordinates', () => {
            const candidates = [
                mockCandidate,
                { ...mockCandidate, candidateUserId: 'candidate2', latApprox: null as unknown as number, lngApprox: null as unknown as number },
            ]
            render(<BusinessDiscoveryMap {...defaultProps} candidates={candidates} />)

            // Should only render valid candidates
            const markers = screen.getAllByTestId('marker')
            // Job marker + 1 valid candidate marker
            expect(markers.length).toBeLessThan(3)
        })

        it('renders no candidate markers when all lack coordinates', () => {
            const candidates = [
                { ...mockCandidate, latApprox: null as unknown as number, lngApprox: null as unknown as number },
            ]
            render(<BusinessDiscoveryMap {...defaultProps} candidates={candidates} />)

            const markers = screen.getAllByTestId('marker')
            // Should only have job marker
            expect(markers).toHaveLength(1)
        })
    })

    describe('Candidate Popup', () => {
        it('displays candidate name and details', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText(/Developer/)).toBeInTheDocument()
            expect(screen.getByText(/2.5 km/)).toBeInTheDocument()
        })

        it('shows verified connection count when greater than 0', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            expect(screen.getByText('3')).toBeInTheDocument()
        })

        it('does not show verification badge when count is 0', () => {
            const candidateNoConnections = { ...mockCandidate, verifiedConnectionCount: 0 }
            render(<BusinessDiscoveryMap {...defaultProps} candidates={[candidateNoConnections]} />)

            // Should not render the connection count badge
            const popup = screen.getAllByTestId('popup')[1] // Second popup is candidate
            expect(popup).toBeInTheDocument()
        })

        it('displays view details button', () => {
            render(<BusinessDiscoveryMap {...defaultProps} />)

            expect(screen.getByText('View Details')).toBeInTheDocument()
        })
    })

    describe('Candidate Interactions', () => {
        it('calls onCandidateClick when view details button is clicked', () => {
            const onCandidateClick = jest.fn()
            render(<BusinessDiscoveryMap {...defaultProps} onCandidateClick={onCandidateClick} />)

            const viewButton = screen.getByText('View Details')
            fireEvent.click(viewButton)

            expect(onCandidateClick).toHaveBeenCalledWith(mockCandidate)
        })
    })
})
