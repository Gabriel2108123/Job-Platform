using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Candidates.Services;
using HospitalityPlatform.Candidates.Entities;
using HospitalityPlatform.Candidates.DTOs;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Tests
{
    public class CoworkerDiscoveryOptInTests
    {
        private readonly Mock<ICandidatesDbContext> _mockContext;
        private readonly Mock<ICandidateIdentityService> _mockIdentityService;
        private readonly Mock<ILogger<CoworkerDiscoveryService>> _mockLogger;
        private readonly CoworkerDiscoveryService _service;

        public CoworkerDiscoveryOptInTests()
        {
            _mockContext = new Mock<ICandidatesDbContext>();
            _mockIdentityService = new Mock<ICandidateIdentityService>();
            _mockLogger = new Mock<ILogger<CoworkerDiscoveryService>>();
            _service = new CoworkerDiscoveryService(_mockContext.Object, _mockIdentityService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task FindPotentialCoworkersAsync_ShouldReturnEmpty_WhenCandidateNotOptedInAtServiceLevel()
        {
            // Arrange
            var candidateId = Guid.NewGuid();
            var settings = new List<CandidateMapSettings> 
            { 
                new CandidateMapSettings { CandidateUserId = candidateId, DiscoverableByWorkplaces = false } 
            }.AsQueryable();

            var mockSettingsDbSet = CreateMockDbSet(settings);
            _mockContext.Setup(c => c.CandidateMapSettings).Returns(mockSettingsDbSet.Object);

            // Act
            var result = await _service.FindPotentialCoworkersAsync(candidateId);

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task FindPotentialCoworkersAsync_ShouldFilterByAllowCoworkerDiscovery()
        {
            // Arrange
            var candidateId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();
            var placeKey = "london|pub|the-lion";

            var settings = new List<CandidateMapSettings> 
            { 
                new CandidateMapSettings { CandidateUserId = candidateId, DiscoverableByWorkplaces = true },
                new CandidateMapSettings { CandidateUserId = otherUserId, DiscoverableByWorkplaces = true }
            }.AsQueryable();

            var workExperiences = new List<WorkExperience>
            {
                // Current user: Opted IN
                new WorkExperience 
                { 
                    CandidateUserId = candidateId, 
                    PlaceKey = placeKey, 
                    AllowCoworkerDiscovery = true,
                    StartDate = DateTime.Today.AddMonths(-6),
                    EndDate = DateTime.Today
                },
                // Other user: Opted OUT
                new WorkExperience 
                { 
                    CandidateUserId = otherUserId, 
                    PlaceKey = placeKey, 
                    AllowCoworkerDiscovery = false, // Opted out
                    StartDate = DateTime.Today.AddMonths(-6),
                    EndDate = DateTime.Today
                }
            }.AsQueryable();

            _mockContext.Setup(c => c.CandidateMapSettings).Returns(CreateMockDbSet(settings).Object);
            _mockContext.Setup(c => c.WorkExperiences).Returns(CreateMockDbSet(workExperiences).Object);

            // Act
            var result = await _service.FindPotentialCoworkersAsync(candidateId);

            // Assert
            Assert.Empty(result); // Should be empty because the other user hasn't opted in for that experience
        }

        [Fact]
        public async Task FindPotentialCoworkersAsync_ShouldReturnMatch_WhenBothOptedIn()
        {
            // Arrange
            var candidateId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();
            var placeKey = "london|pub|the-lion";

            var settings = new List<CandidateMapSettings> 
            { 
                new CandidateMapSettings { CandidateUserId = candidateId, DiscoverableByWorkplaces = true },
                new CandidateMapSettings { CandidateUserId = otherUserId, DiscoverableByWorkplaces = true }
            }.AsQueryable();

            var workExperiences = new List<WorkExperience>
            {
                new WorkExperience 
                { 
                    CandidateUserId = candidateId, 
                    PlaceKey = placeKey, 
                    AllowCoworkerDiscovery = true,
                    EmployerName = "The Lion",
                    StartDate = DateTime.Today.AddMonths(-6),
                    EndDate = DateTime.Today
                },
                new WorkExperience 
                { 
                    CandidateUserId = otherUserId, 
                    PlaceKey = placeKey, 
                    AllowCoworkerDiscovery = true, // Both opted in
                    EmployerName = "The Lion",
                    StartDate = DateTime.Today.AddMonths(-6),
                    EndDate = DateTime.Today
                }
            }.AsQueryable();

            _mockContext.Setup(c => c.CandidateMapSettings).Returns(CreateMockDbSet(settings).Object);
            _mockContext.Setup(c => c.WorkExperiences).Returns(CreateMockDbSet(workExperiences).Object);

            _mockIdentityService.Setup(i => i.GetUserProfilesAsync(It.IsAny<IEnumerable<Guid>>()))
                .ReturnsAsync(new Dictionary<Guid, UserProfileDto> 
                {
                    { otherUserId, new UserProfileDto { FirstName = "John", LastName = "Doe" } }
                });

            // Act
            var result = await _service.FindPotentialCoworkersAsync(candidateId);

            // Assert
            Assert.Single(result);
            Assert.Equal(otherUserId, result[0].CandidateUserId);
            Assert.True(result[0].MatchConfidence >= 0.8);
            Assert.Contains("Same workplace", result[0].MatchReasons);
        }

        private static Mock<DbSet<T>> CreateMockDbSet<T>(IQueryable<T> data) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IAsyncEnumerable<T>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

            mockSet.As<IQueryable<T>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<T>(data.Provider));

            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            return mockSet;
        }
    }

    // Helper classes for async testing with Mock DbSet
    internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;
        public TestAsyncEnumerator(IEnumerator<T> inner) => _inner = inner;
        public ValueTask DisposeAsync() { _inner.Dispose(); return ValueTask.CompletedTask; }
        public ValueTask<bool> MoveNextAsync() => new ValueTask<bool>(_inner.MoveNext());
        public T Current => _inner.Current;
    }

    internal class TestAsyncQueryProvider<TEntity> : Microsoft.EntityFrameworkCore.Query.IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;
        internal TestAsyncQueryProvider(IQueryProvider inner) => _inner = inner;
        public IQuery CreateQuery(System.Linq.Expressions.Expression expression) => new TestAsyncEnumerable<TEntity>(expression);
        public IQuery<TElement> CreateQuery<TElement>(System.Linq.Expressions.Expression expression) => new TestAsyncEnumerable<TElement>(expression);
        public object Execute(System.Linq.Expressions.Expression expression) => _inner.Execute(expression);
        public TResult Execute<TResult>(System.Linq.Expressions.Expression expression) => _inner.Execute<TResult>(expression);
        public TResult ExecuteAsync<TResult>(System.Linq.Expressions.Expression expression, System.Threading.CancellationToken cancellationToken) => Execute<TResult>(expression);
    }

    internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
        public TestAsyncEnumerable(System.Linq.Expressions.Expression expression) : base(expression) { }
        public IAsyncEnumerator<T> GetAsyncEnumerator(System.Threading.CancellationToken cancellationToken = default) => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }
}
