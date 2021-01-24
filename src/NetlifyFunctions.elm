module NetlifyFunctions exposing (..)

import Json.Encode as JE
import TsInterop.Decode as TsDecode
import TsInterop.Encode as TsEncode exposing (required)


hello :
    { request : TsEncode.Encoder { name : String }
    , response : TsDecode.Decoder String
    }
hello =
    { request =
        TsEncode.object
            [ required "name" .name TsEncode.string
            ]
    , response =
        TsDecode.field "message" TsDecode.string
    }


weather :
    { request : TsEncode.Encoder { unit : TemperatureUnit }
    , response : TsDecode.Decoder Int
    }
weather =
    { request =
        TsEncode.object
            [ required "unit" .unit unitEncoder
            ]
    , response =
        TsDecode.field "degrees" TsDecode.int
    }


type TemperatureUnit
    = C
    | F


unitEncoder : TsEncode.Encoder TemperatureUnit
unitEncoder =
    TsEncode.union
        (\vC vF value ->
            case value of
                C ->
                    vC

                F ->
                    vF
        )
        |> TsEncode.variantLiteral (JE.string "F")
        |> TsEncode.variantLiteral (JE.string "C")
        |> TsEncode.buildUnion


type alias LambdaDefinition requestInput responseOutput =
    { request : TsEncode.Encoder requestInput
    , response : TsDecode.Decoder responseOutput
    }
