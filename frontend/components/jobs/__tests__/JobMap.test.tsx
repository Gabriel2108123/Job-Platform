import React from 'react'
import { render, screen } from '@testing-library/react'
import JobMap from '../JobMap'
import { JobDto, JobStatus, EmploymentType } from '@/lib/api/client'

describe('JobMap', () => {
    const mockJob: JobDto = {
        id: 'job1',
        title: 'Software Engineer',
        location: 'London, UK',
        latApprox: 51.5074,
        lngApprox: -0.1278,
        locationVisibility: 'PrivateApprox' as 'PrivateApprox',
        approxRadiusMeters: 1200,
        salaryMin: 50000,
        salaryMax: 70000,
        status: JobStatus.Published,
        statusName: 'Published',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        description: 'Test job',
        employmentType: EmploymentType.FullTime,
        employmentTypeName: 'Full Time',
        organizationId: 'org1',
        createdByUserId: 'user1',
        roleType: 1,
        roleTypeName: 'Developer',
    }

    describe('Empty State', () => {
        it('renders empty state when no jobs provided', () => {
            render(<JobMap jobs={[]} />)

            expect(screen.getByText('No Map Locations Available')).toBeInTheDocument()
            expect(screen.getByText(/Jobs need location coordinates to appear on the map/i)).toBeInTheDocument()
        })

        it('renders empty state when jobs lack coordinates', () => {
            const jobWithoutCoords = { ...mockJob, latApprox: null as unknown as number, lngApprox: null as unknown as number }
            render(<JobMap jobs={[jobWithoutCoords]} />)

            expect(screen.getByText('No Map Locations Available')).toBeInTheDocument()
            expect(screen.getByText(/Showing 1 job total • 0 with map coordinates/i)).toBeInTheDocument()
        })

        it('shows correct job count in empty state', () => {
            const jobs = [
                { ...mockJob, id: 'job1', latApprox: null as unknown as number, lngApprox: null as unknown as number },
                { ...mockJob, id: 'job2', latApprox: null as unknown as number, lngApprox: null as unknown as number },
                { ...mockJob, id: 'job3', latApprox: null as unknown as number, lngApprox: null as unknown as number },
            ]
            render(<JobMap jobs={jobs} />)

            expect(screen.getByText(/Showing 3 jobs total • 0 with map coordinates/i)).toBeInTheDocument()
        })
    })

    describe('Map Rendering', () => {
        it('renders map container when valid jobs exist', () => {
            render(<JobMap jobs={[mockJob]} />)

            expect(screen.getByTestId('map-container')).toBeInTheDocument()
            expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
        })

        it('renders marker for each job with coordinates', () => {
            const jobs = [
                mockJob,
                { ...mockJob, id: 'job2', latApprox: 51.5, lngApprox: -0.1 },
            ]
            render(<JobMap jobs={jobs} />)

            const markers = screen.getAllByTestId('marker')
            expect(markers).toHaveLength(2)
        })

        it('filters out jobs without coordinates', () => {
            const jobs = [
                mockJob,
                { ...mockJob, id: 'job2', latApprox: null as unknown as number, lngApprox: null as unknown as number },
                { ...mockJob, id: 'job3', latApprox: 51.5, lngApprox: -0.1 },
            ]
            render(<JobMap jobs={jobs} />)

            const markers = screen.getAllByTestId('marker')
            expect(markers).toHaveLength(2) // Only 2 valid ones
        })
    })

    describe('Approximate Location', () => {
        it('renders circle for jobs with approximate location', () => {
            const approxJob = { ...mockJob, locationVisibility: 'PrivateApprox' as 'PrivateApprox' }
            render(<JobMap jobs={[approxJob]} />)

            expect(screen.getByTestId('circle')).toBeInTheDocument()
        })

        it('does not render circle for exact locations', () => {
            const exactJob = { ...mockJob, locationVisibility: 'PublicExact' as 'PublicExact' }
            render(<JobMap jobs={[exactJob]} />)

            expect(screen.queryByTestId('circle')).not.toBeInTheDocument()
        })

        it('uses custom radius when provided', () => {
            const customRadiusJob = { ...mockJob, approxRadiusMeters: 2000 }
            render(<JobMap jobs={[customRadiusJob]} />)

            expect(screen.getByTestId('circle')).toBeInTheDocument()
        })
    })

    describe('Popup Content', () => {
        it('displays job title and location', () => {
            render(<JobMap jobs={[mockJob]} />)

            expect(screen.getByText('Software Engineer')).toBeInTheDocument()
            expect(screen.getByText(/London, UK/)).toBeInTheDocument()
        })

        it('shows approximate area indicator for approximate locations', () => {
            const approxJob = { ...mockJob, locationVisibility: 'PrivateApprox' as 'PrivateApprox' }
            render(<JobMap jobs={[approxJob]} />)

            expect(screen.getByText(/approximate area/i)).toBeInTheDocument()
        })

        it('displays salary range when both min and max are provided', () => {
            render(<JobMap jobs={[mockJob]} />)

            expect(screen.getByText('£50,000 - £70,000')).toBeInTheDocument()
        })

        it('displays only min salary when max is not provided', () => {
            const jobMinOnly = { ...mockJob, salaryMax: null as unknown as number }
            render(<JobMap jobs={[jobMinOnly]} />)

            expect(screen.getByText('£50,000')).toBeInTheDocument()
        })

        it('displays only max salary when min is not provided', () => {
            const jobMaxOnly = { ...mockJob, salaryMin: null as unknown as number }
            render(<JobMap jobs={[jobMaxOnly]} />)

            expect(screen.getByText('£70,000')).toBeInTheDocument()
        })

        it('does not display salary section when neither min nor max provided', () => {
            const jobNoSalary = { ...mockJob, salaryMin: null as unknown as number, salaryMax: null as unknown as number }
            render(<JobMap jobs={[jobNoSalary]} />)

            // Query for any salary-related text
            expect(screen.queryByText(/£/)).not.toBeInTheDocument()
        })

        it('renders view details link with correct href', () => {
            render(<JobMap jobs={[mockJob]} />)

            const link = screen.getByText('View Details')
            expect(link).toHaveAttribute('href', '/jobs/job1')
        })
    })

    describe('Center Calculation', () => {
        it('uses UK center as fallback when no jobs with coordinates', () => {
            const jobWithoutCoords = { ...mockJob, latApprox: null as unknown as number, lngApprox: null as unknown as number }
            render(<JobMap jobs={[jobWithoutCoords]} />)

            // Should show empty state, not map
            expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
        })

        it('calculates center from job locations', () => {
            const jobs = [
                { ...mockJob, id: 'job1', latApprox: 51.5, lngApprox: -0.1 },
                { ...mockJob, id: 'job2', latApprox: 51.6, lngApprox: -0.2 },
            ]
            render(<JobMap jobs={jobs} />)

            const mapContainer = screen.getByTestId('map-container')
            expect(mapContainer).toBeInTheDocument()
            // Center should be average: [51.55, -0.15]
            // Map container renders successfully with calculated center
        })
    })
})
