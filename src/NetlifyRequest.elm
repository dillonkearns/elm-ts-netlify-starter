module NetlifyRequest exposing (hello, weather)

import Http
import NetlifyFunctions
import TsInterop.Decode as TsDecode
import TsInterop.Encode as TsEncode


hello input =
    Http.post
        { url = "/.netlify/functions/elm-functions?msg=hello"
        , body =
            input
                |> TsEncode.encoder NetlifyFunctions.hello.input
                |> Http.jsonBody
        , expect =
            NetlifyFunctions.hello.output
                |> TsDecode.decoder
                |> Http.expectJson identity
        }

weather input =
    Http.post
        { url = "/.netlify/functions/elm-functions?msg=weather"
        , body =
            input
                |> TsEncode.encoder NetlifyFunctions.weather.input
                |> Http.jsonBody
        , expect =
            NetlifyFunctions.weather.output
                |> TsDecode.decoder
                |> Http.expectJson identity
        }
