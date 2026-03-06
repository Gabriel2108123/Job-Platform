namespace HospitalityPlatform.Entitlements.Exceptions;

public class EntitlementException : Exception
{
    public string LimitType { get; }
    public int CurrentUsage { get; }
    public int MaxLimit { get; }

    public EntitlementException(string message, string limitType, int currentUsage, int maxLimit) 
        : base(message)
    {
        LimitType = limitType;
        CurrentUsage = currentUsage;
        MaxLimit = maxLimit;
    }
}
