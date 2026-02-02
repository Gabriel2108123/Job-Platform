using System.Text;
using System.Text.RegularExpressions;

namespace HospitalityPlatform.Candidates.Services;

public interface IPlaceKeyGenerator
{
    string GeneratePlaceKey(string employerName, string city);
}

public class PlaceKeyGenerator : IPlaceKeyGenerator
{
    public string GeneratePlaceKey(string employerName, string city)
    {
        // 1. Normalize Employer Name
        // Remove common suffixes, punctuation, and lowercase
        var normalizedEmployer = NormalizeEmployerName(employerName);

        // 2. Normalize City
        var normalizedCity = NormalizeCity(city);

        // 3. Combine
        return $"{normalizedEmployer}|{normalizedCity}";
    }

    private string NormalizeEmployerName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "unknown";

        var n = name.ToLowerInvariant().Trim();
        
        // Remove punctuation
        n = Regex.Replace(n, @"[^\w\s]", "");

        // Remove common suffixes
        string[] suffixes = { " ltd", " limited", " plc", " inc", " llc", " group", " holdings" };
        foreach (var suffix in suffixes)
        {
            if (n.EndsWith(suffix))
            {
                n = n.Substring(0, n.Length - suffix.Length).Trim();
            }
        }

        // Remove whitespace
        n = Regex.Replace(n, @"\s+", "");

        return n;
    }

    private string NormalizeCity(string city)
    {
        if (string.IsNullOrWhiteSpace(city)) return "anywhere";
        
        var n = city.ToLowerInvariant().Trim();
        n = Regex.Replace(n, @"[^\w]", ""); // Remove all non-word chars
        return n;
    }
}
