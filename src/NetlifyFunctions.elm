module NetlifyFunctions exposing (..)

import Json.Encode as JE
import TsInterop.Decode as TsDecode
import TsInterop.Encode as TsEncode exposing (required)


hello :
    { input : TsEncode.Encoder { name : String }
    , output : TsDecode.Decoder String
    }
hello =
    { input =
        TsEncode.object
            [ required "name" .name TsEncode.string
            ]
    , output =
        TsDecode.field "message" TsDecode.string
    }


weather :
    { input : TsEncode.Encoder { unit : TemperatureUnit }
    , output : TsDecode.Decoder Int
    }
weather =
    { input =
        TsEncode.object
            [ required "unit" .unit unitEncoder
            ]
    , output =
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
    { input : TsEncode.Encoder requestInput
    , output : TsDecode.Decoder responseOutput
    }
