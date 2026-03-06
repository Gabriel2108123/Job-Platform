using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Core.Services;

public interface ILocationService
{
    Task<(decimal? lat, decimal? lng)> GetApproxCoordsAsync(string? postalCode, string? city);
    Task<(decimal? lat, decimal? lng)> GetExactCoordsAsync(string fullAddress);
}

public class LocationService : ILocationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LocationService> _logger;

    public LocationService(IHttpClientFactory httpClientFactory, ILogger<LocationService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // UK major cities centroid lookup table
    private static readonly Dictionary<string, (decimal lat, decimal lng)> UkCityCentroids = new(StringComparer.OrdinalIgnoreCase)
    {
        // England
        { "London", (51.5074m, -0.1278m) },
        { "Birmingham", (52.4862m, -1.8904m) },
        { "Manchester", (53.4808m, -2.2426m) },
        { "Leeds", (53.8008m, -1.5491m) },
        { "Liverpool", (53.4084m, -2.9916m) },
        { "Bristol", (51.4545m, -2.5879m) },
        { "Sheffield", (53.3811m, -1.4701m) },
        { "Newcastle", (54.9783m, -1.6178m) },
        { "Nottingham", (52.9548m, -1.1581m) },
        { "Leicester", (52.6369m, -1.1398m) },
        { "Coventry", (52.4068m, -1.5197m) },
        { "Brighton", (50.8225m, -0.1372m) },
        { "Southampton", (50.9097m, -1.4044m) },
        { "Portsmouth", (50.8198m, -1.0880m) },
        { "Reading", (51.4543m, -0.9781m) },
        { "Derby", (52.9225m, -1.4746m) },
        { "Plymouth", (50.3755m, -4.1427m) },
        { "York", (53.9600m, -1.0873m) },
        { "Norwich", (52.6309m, 1.2974m) },
        { "Cambridge", (52.2053m, 0.1218m) },
        { "Oxford", (51.7520m, -1.2577m) },
        { "Bath", (51.3811m, -2.3590m) },
        { "Exeter", (50.7184m, -3.5339m) },
        { "Canterbury", (51.2802m, 1.0789m) },
        
        // Scotland
        { "Glasgow", (55.8642m, -4.2518m) },
        { "Edinburgh", (55.9533m, -3.1883m) },
        { "Aberdeen", (57.1497m, -2.0943m) },
        { "Dundee", (56.4620m, -2.9707m) },
        { "Inverness", (57.4778m, -4.2247m) },
        { "Stirling", (56.1165m, -3.9369m) },
        { "Perth", (56.3959m, -3.4370m) },
        
        // Wales
        { "Cardiff", (51.4816m, -3.1791m) },
        { "Swansea", (51.6214m, -3.9436m) },
        { "Newport", (51.5842m, -2.9977m) },
        { "Wrexham", (53.0465m, -2.9930m) },
        { "Bangor", (53.2280m, -4.1290m) },
        
        // Northern Ireland
        { "Belfast", (54.5973m, -5.9301m) },
        { "Derry", (54.9966m, -7.3086m) },
        { "Londonderry", (54.9966m, -7.3086m) },
        { "Armagh", (54.3503m, -6.6528m) },
        { "Newry", (54.1751m, -6.3402m) }
    };

    public async Task<(decimal? lat, decimal? lng)> GetApproxCoordsAsync(string? postalCode, string? city)
    {
        // Add Nominatim query first
        try
        {
            var queryParts = new List<string>();
            if (!string.IsNullOrWhiteSpace(postalCode)) queryParts.Add(postalCode.Trim());
            if (!string.IsNullOrWhiteSpace(city)) queryParts.Add(city.Trim());

            if (queryParts.Count > 0)
            {
                var query = string.Join(" ", queryParts);
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.UserAgent.ParseAdd("HospitalityPlatform/1.0");

                var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(query)}&format=json&limit=1";
                var response = await client.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonStr = await response.Content.ReadAsStringAsync();
                    var results = JsonSerializer.Deserialize<JsonElement>(jsonStr);
                    
                    if (results.ValueKind == JsonValueKind.Array && results.GetArrayLength() > 0)
                    {
                        var firstResult = results[0];
                        if (firstResult.TryGetProperty("lat", out var latProp) && 
                            firstResult.TryGetProperty("lon", out var lonProp))
                        {
                            if (decimal.TryParse(latProp.GetString(), CultureInfo.InvariantCulture, out var lat) &&
                                decimal.TryParse(lonProp.GetString(), CultureInfo.InvariantCulture, out var lon))
                            {
                                _logger.LogInformation("Successfully geocoded '{query}' using Nominatim", query);
                                return (lat, lon);
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Nominatim geocoding failed. Falling back to centroid lookup.");
        }

        // Priority 1: Use postal code outward code (if available)
        if (!string.IsNullOrWhiteSpace(postalCode))
        {
            var approxFromPostcode = GetApproxFromPostcode(postalCode);
            if (approxFromPostcode.HasValue)
                return approxFromPostcode.Value;
        }

        // Priority 2: Use city centroid - improved matching
        if (!string.IsNullOrWhiteSpace(city))
        {
            var matchedCity = FindMatchingCity(city);
            if (matchedCity != null && UkCityCentroids.TryGetValue(matchedCity, out var centroid))
            {
                return centroid;
            }
        }

        // Unknown location - return null (DO NOT default to London)
        return (null, null);
    }

    /// <summary>
    /// Try to extract a known city name from a location string.
    /// Handles formats like "Brighton", "Brighton, UK", "Central Brighton", "Manchester City Centre"
    /// </summary>
    private string? FindMatchingCity(string location)
    {
        var normalizedLocation = location.Trim().ToLowerInvariant();
        
        // First try exact match
        foreach (var cityName in UkCityCentroids.Keys)
        {
            if (normalizedLocation.Equals(cityName, StringComparison.OrdinalIgnoreCase))
            {
                return cityName;
            }
        }
        
        // Try to find city name within the location string
        // Sort by length descending to match longer city names first (e.g., "Newcastle upon Tyne" before "Newcastle")
        foreach (var cityName in UkCityCentroids.Keys.OrderByDescending(c => c.Length))
        {
            if (normalizedLocation.Contains(cityName.ToLowerInvariant()))
            {
                return cityName;
            }
        }
        
        return null;
    }

    public async Task<(decimal? lat, decimal? lng)> GetExactCoordsAsync(string fullAddress)
    {
        if (string.IsNullOrWhiteSpace(fullAddress)) return (null, null);

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("HospitalityPlatform/1.0");

            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(fullAddress)}&format=json&limit=1";
            var response = await client.GetAsync(url);
            
            if (response.IsSuccessStatusCode)
            {
                var jsonStr = await response.Content.ReadAsStringAsync();
                var results = JsonSerializer.Deserialize<JsonElement>(jsonStr);
                
                if (results.ValueKind == JsonValueKind.Array && results.GetArrayLength() > 0)
                {
                    var firstResult = results[0];
                    if (firstResult.TryGetProperty("lat", out var latProp) && 
                        firstResult.TryGetProperty("lon", out var lonProp))
                    {
                        if (decimal.TryParse(latProp.GetString(), CultureInfo.InvariantCulture, out var lat) &&
                            decimal.TryParse(lonProp.GetString(), CultureInfo.InvariantCulture, out var lon))
                        {
                            return (lat, lon);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Nominatim strict geocoding failed for exact address.");
        }

        return (null, null);
    }

    private (decimal lat, decimal lng)? GetApproxFromPostcode(string postalCode)
    {
        // Extract outward code (e.g., "SW1A" from "SW1A 1AA")
        var parts = postalCode.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return null;

        var outwardCode = parts[0].ToUpperInvariant();
        
        // Simple UK postcode area to approx centroid mapping
        // This is a basic implementation - in production, use a proper postcode database
        var area = new string(outwardCode.TakeWhile(char.IsLetter).ToArray());

        var areaCentroids = new Dictionary<string, (decimal lat, decimal lng)>
        {
            // London areas
            { "SW", (51.4875m, -0.1687m) },
            { "SE", (51.4934m, -0.0098m) },
            { "NW", (51.5656m, -0.2055m) },
            { "N", (51.5906m, -0.1172m) },
            { "E", (51.5252m, 0.0422m) },
            { "W", (51.5145m, -0.2048m) },
            { "EC", (51.5174m, -0.0959m) },
            { "WC", (51.5155m, -0.1267m) },
            
            // Major cities (approximate by postcode prefix)
            { "M", (53.4808m, -2.2426m) },  // Manchester
            { "B", (52.4862m, -1.8904m) },  // Birmingham
            { "L", (53.4084m, -2.9916m) },  // Liverpool
            { "LS", (53.8008m, -1.5491m) }, // Leeds
            { "S", (53.3811m, -1.4701m) },  // Sheffield
            { "NE", (54.9783m, -1.6178m) }, // Newcastle
            { "NG", (52.9548m, -1.1581m) }, // Nottingham
            { "BS", (51.4545m, -2.5879m) }, // Bristol
            { "G", (55.8642m, -4.2518m) },  // Glasgow
            { "EH", (55.9533m, -3.1883m) }, // Edinburgh
            { "CF", (51.4816m, -3.1791m) }, // Cardiff
            { "BT", (54.5973m, -5.9301m) }  // Belfast
        };

        if (areaCentroids.TryGetValue(area, out var centroid))
        {
            return centroid;
        }

        return null;
    }
}
