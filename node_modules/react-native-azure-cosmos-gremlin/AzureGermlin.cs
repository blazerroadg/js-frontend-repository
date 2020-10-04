using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using Gremlin.Net.Driver;
using Gremlin.Net.Structure.IO.GraphSON;
using Grpc.Core.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Newtonsoft.Json;

namespace FireBaseToken
{
    public class AzureResult
    {
        public int status { get; set; }
        public object result { get; set; }
    }

    public class GraphParameter
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class GraphQuery
    {
        public string Query { get; set; }
        public List<GraphParameter> Parameters { get; set; }
    }

    public static class AzureGermlinAppFunction
    {
        const string YOUR_AZURE_GERMLIN_DB_PASSWORD = "YOUR_AZURE_GERMLIN_DB_PASSWORD";
        const string YOU_AZURE_GERMLIN_DB_HOST = "YOU_AZURE_GERMLIN_DB_HOST";
        const string YOU_AZURE_GERMLIN_DB_USERNAME = "YOU_AZURE_GERMLIN_DB_USERNAME";

        [FunctionName("AzureGermlin")]
        public static async Task<AzureResult> AzureGermlin(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            try
            {
                var tdate = req.Headers["x-ms-date"].FirstOrDefault();
                var reqDate = Convert.ToDateTime(tdate);
                if (reqDate < DateTime.UtcNow.AddMinutes(-10))
                {
                    throw new HttpResponseException(HttpStatusCode.BadRequest);
                }
                var auth = req.Headers["Authorization"].FirstOrDefault();
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<GraphQuery>(requestBody);
                var he = $"POST{data.Parameters.Count}AzureGermlin{tdate}";
                string password = $"{YOUR_AZURE_GERMLIN_DB_PASSWORD}";
                var hmacSha256 = new System.Security.Cryptography.HMACSHA256
                {
                    Key = Convert.FromBase64String(password)
                };
                byte[] hashPayLoad = hmacSha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(he));
                string signature = Convert.ToBase64String(hashPayLoad);
                if (signature != auth)
                {
                    throw new HttpResponseException(HttpStatusCode.Unauthorized);
                }

                data.Parameters.ForEach(t =>
                {

                    data.Query = data.Query.Replace(t.Name, t.Value);
                });




                var gremlinServer = new GremlinServer(YOU_AZURE_GERMLIN_DB_HOST, 443, enableSsl: true,
                                       username: YOU_AZURE_GERMLIN_DB_USERNAME,
                                       password: password);

                using (var gremlinClient = new GremlinClient(gremlinServer,
                    new GraphSON2Reader(), new GraphSON2Writer(), GremlinClient.GraphSON2MimeType))
                {

                    var resultSet = await gremlinClient.SubmitAsync<dynamic>(data.Query);
                    return new AzureResult() { status = 200, result = resultSet };

                }
            }
            catch (Exception ex)
            {
                return new AzureResult() { status = 500, result = ex.Message };
            }

        }
    }
}
