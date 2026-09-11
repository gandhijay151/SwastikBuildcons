// Integration tests run against a single shared PostgreSQL (Neon) instance, each
// test class using its own throwaway schema. Running classes in parallel puts
// concurrent connection/schema pressure on that single instance and causes
// flaky failures, so disable cross-class parallelization and run serially.
using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]
