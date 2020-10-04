# react-native-azure-cosmos-gremlin
This package provide rest api for azure cosmos germlin graph data base query access

# Install

## Step 1

```bash
npm i react-native-azure-cosmos-gremlin --save
```

## Step 2 Azure App Function
### create APP FUNCTION project on VS and paste AzureGermlin.cs file content in this repository on it 

how to create azure app function :
- https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-vs

copy this function on your azure app function body 

```c#
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
                                       password: YOUR_AZURE_GERMLIN_DB_PASSWORD);

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

```
### You can follow this articale to implement your own c# germlin app function 
- https://docs.microsoft.com/en-us/azure/cosmos-db/create-graph-dotnet


## Usage

Import library

```javascript
import { azuregermlinfetch, initCosmosGermlin } from 'react-native-azure-cosmos-gremlin/germlin'
```

init azure cosmos germlin setting 

```javascript
  constructor(props) {
    super(props);
   initAzureCosmos({
      masterkey: "YOUR_GERMLIN_KEY",
      methodname: "YOUR_APP_FUNCTION_METHOD_NAME",
      serviceurl: "YOUR_APP_FUNCTION_SERVICE_URL"

    })
      ....
  }
```

upload file from cameraroll :
```javascript
fetchgermlin = async () => {
   const response = await azuregermlinfetch({
      query: "g.addV('user').property('id', '@id').property('code', '@code').property('photoUri', '@photoUri').property('uid', '@uid')",
      "parameters": [
        { name: "@id", value: "10000000" },
        { name: "@code", value: "001" },
        { name: "@photoUri", value: "" },
        { name: "@uid", value: "blazer.road@gmail.com" },
      ]
    })
    const resData = await response.json();
    console.log(resData);

  }
```

