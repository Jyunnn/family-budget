using FamilyBudget.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var dataRoot = Path.Combine(builder.Environment.ContentRootPath, "App_Data");
Directory.CreateDirectory(dataRoot);
var dbPath = Path.Combine(dataRoot, "family-budget.db");
var connectionFactory = new SqliteConnectionFactory($"Data Source={dbPath};Foreign Keys=True");
builder.Services.AddSingleton(connectionFactory);

var app = builder.Build();

await DatabaseInitializer.InitializeAsync(connectionFactory);

app.UseCors("AllowAll");
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
