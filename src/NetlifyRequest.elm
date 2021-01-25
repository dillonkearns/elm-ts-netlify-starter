module NetlifyRequest exposing (hello, weather)

import Http
import NetlifyFunctions
import TsJson.Decode as TsDecode
import TsJson.Encode as TsEncode


hello request =
    Http.post
        { url = "/.netlify/functions/elm-functions?msg=hello"
        , body =
            request
                |> TsEncode.encoder NetlifyFunctions.hello.request
                |> Http.jsonBody
        , expect =
            NetlifyFunctions.hello.response
                |> TsDecode.decoder
                |> Http.expectJson identity
        }

weather request =
    Http.post
        { url = "/.netlify/functions/elm-functions?msg=weather"
        , body =
            request
                |> TsEncode.encoder NetlifyFunctions.weather.request
                |> Http.jsonBody
        , expect =
            NetlifyFunctions.weather.response
                |> TsDecode.decoder
                |> Http.expectJson identity
        }
