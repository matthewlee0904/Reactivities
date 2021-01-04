using System;
using System.Linq;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
  public class DataContext : DbContext
  {
    public DataContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<Value> Values { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {

      var data = from num in Enumerable.Range(1, 10) select new Value { Id = num, Name = "Value 10" + num };

      builder.Entity<Value>().HasData(
          data
      );
    }
  }
}
