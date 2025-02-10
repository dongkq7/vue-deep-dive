import track from "../../effect/track.js"
import { TrackOpTypes } from "../../utils.js"

export default function (target) {

  track(target, TrackOpTypes.ITERATE);
  
  return Reflect.ownKeys(target);
}
