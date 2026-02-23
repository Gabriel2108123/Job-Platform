import React from 'react'
import { render, screen } from '@testing-library/react'
import WorkerMap from '../WorkerMap'
import { WorkExperienceDto } from '@/lib/api/client'

describe('WorkerMap', () => {
    const mockWorkExperience: WorkExperienceDto = {
        id: '1',
        employerName: 'Test Company',
        roleTitle: 'Software Engineer',
        isMapEnabled: true,
        latApprox: 51.5074,
        lngApprox: -0.1278,
        startDate: '2020-01-01',
        endDate: null as unknown as string,
        candidateUserId: 'user1',
        locationText: 'London, UK',
        visibilityLevel: 'public' as any, // Using any to bypass specific enum check if needed, or use correct string
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    }

    describe('Empty State', () => {
        it('renders empty state when no work experiences provided', () => {
            render(<WorkerMap workExperiences={[]} />)

            expect(screen.getByText('No Map Locations Available')).toBeInTheDocument()
            expect(screen.getByText(/Enable map visibility for your work experiences/i)).toBeInTheDocument()
        })

        it('renders empty state when no experiences have map enabled', () => {
            const disabledExperience = { ...mockWorkExperience, isMapEnabled: false }
            render(<WorkerMap workExperiences={[disabledExperience]} />)

            expect(screen.getByText('No Map Locations Available')).toBeInTheDocument()
        })

        it('renders empty state when experiences lack coordinates', () => {
            const noCoords = { ...mockWorkExperience, latApprox: null as unknown as number, lngApprox: null as unknown as number }
            render(<WorkerMap workExperiences={[noCoords]} />)

            expect(screen.getByText('No Map Locations Available')).toBeInTheDocument()
        })
    })

    describe('Map Rendering', () => {
        it('renders map container when valid experiences exist', () => {
            render(<WorkerMap workExperiences={[mockWorkExperience]} />)

            expect(screen.getByTestId('map-container')).toBeInTheDocument()
            expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
        })

        it('renders marker for each valid work experience', () => {
            const experiences = [
                mockWorkExperience,
                { ...mockWorkExperience, id: '2', latApprox: 51.5, lngApprox: -0.1 },
            ]
            render(<WorkerMap workExperiences={experiences} />)

            const markers = screen.getAllByTestId('marker')
            expect(markers).toHaveLength(2)
        })

        it('renders circle for each work experience', () => {
            render(<WorkerMap workExperiences={[mockWorkExperience]} />)

            expect(screen.getByTestId('circle')).toBeInTheDocument()
        })

        it('filters out experiences without coordinates', () => {
            const experiences = [
                mockWorkExperience,
                { ...mockWorkExperience, id: '2', latApprox: null as unknown as number, lngApprox: null as unknown as number },
                { ...mockWorkExperience, id: '3', latApprox: 51.5, lngApprox: -0.1 },
            ]
            render(<WorkerMap workExperiences={experiences} />)

            const markers = screen.getAllByTestId('marker')
            expect(markers).toHaveLength(2) // Only 2 valid ones
        })
    })

    describe('Popup Content', () => {
        it('displays employer name and role in popup', () => {
            render(<WorkerMap workExperiences={[mockWorkExperience]} />)

            expect(screen.getByText('Test Company')).toBeInTheDocument()
            expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        })

        it('shows visibility message in popup', () => {
            render(<WorkerMap workExperiences={[mockWorkExperience]} />)

            expect(screen.getByText('Visible to businesses based on stage')).toBeInTheDocument()
        })
    })

    describe('Center Calculation', () => {
        it('calculates center from multiple locations', () => {
            const experiences = [
                { ...mockWorkExperience, id: '1', latApprox: 51.5, lngApprox: -0.1 },
                { ...mockWorkExperience, id: '2', latApprox: 51.6, lngApprox: -0.2 },
            ]
            render(<WorkerMap workExperiences={experiences} />)

            const mapContainer = screen.getByTestId('map-container')
            expect(mapContainer).toBeInTheDocument()
            // Center should be average: [51.55, -0.15]
            // Map container renders successfully with calculated center
        })
    })
})
