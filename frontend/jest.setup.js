import '@testing-library/jest-dom'

// Polyfill MessageChannel for react-dom/server
if (typeof global.MessageChannel === 'undefined') {
    global.MessageChannel = class MessageChannel {
        constructor() {
            this.port1 = { onmessage: null, postMessage: () => { } }
            this.port2 = { onmessage: null, postMessage: () => { } }
        }
    }
}


// Mock Leaflet
global.L = {
    Icon: {
        Default: {
            prototype: {
                _getIconUrl: jest.fn(),
            },
            mergeOptions: jest.fn(),
        },
    },
    divIcon: jest.fn(() => ({})),
    icon: jest.fn(() => ({})),
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return []
    }
    unobserve() { }
}

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
    MapContainer: ({ children, center, zoom, className, style }) => (
        <div data-testid="map-container" data-center={center} data-zoom={zoom} className={className} style={style}>
            {children}
        </div>
    ),
    TileLayer: (props) => <div data-testid="tile-layer" />,
    Marker: ({ children, position }) => <div data-testid="marker" data-position={position}>{children}</div>,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    Circle: ({ center, radius }) => <div data-testid="circle" data-center={center} data-radius={radius} />,
}))

// Mock react-dom/server
jest.mock('react-dom/server', () => ({
    renderToStaticMarkup: (element) => '<div>mocked-icon</div>',
}))

// Mock CSS imports
jest.mock('leaflet/dist/leaflet.css', () => ({}))
