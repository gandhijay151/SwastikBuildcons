namespace SwastikBuildcons.Api.Options;

public class AiOptions
{
    public const string SectionName = "Ai";

    /// <summary>
    /// Google Gemini API key. When empty, AI lead analysis is disabled and
    /// leads are simply stored without a summary/priority (no-op, like SMTP).
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Gemini model to use. Flash is fast and has a free tier.</summary>
    public string Model { get; set; } = "gemini-flash-latest";
}
