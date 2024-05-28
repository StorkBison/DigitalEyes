import { Link, useHistory } from "react-router-dom"
import { useState } from "react"
import { ReactComponent as CheckShield } from "../../assets/icons/check-shield.svg"
import * as ROUTES from "../../constants/routes"
// @ts-ignore-next-line
import { Collection } from "../../types"
import { useTooltipState } from "reakit/Tooltip"
import { CollectionThumbnail } from "../CollectionThumbnail"
import { formatToHyphen } from "../../utils"

export interface CollectionCardProps {
  collection: Collection
}

export const CollectionCardOld: React.FC<CollectionCardProps> = ({
  collection,
}) => {
  const [cacheFailed, setCacheFailed] = useState<boolean>(false)
  const tooltipVerified = useTooltipState()

  const goToCollection = () => {
    return `${ROUTES.COLLECTIONS}/${formatToHyphen(collection?.name)}`
  }

  return (
    <div
      className={`w-full shadow-lg bg-color-main-gray-medium hover:bg-gray-800 cursor-pointer overflow-hidden mx-auto md:mx-0 rounded-lg`}
    >
      <Link to={goToCollection}>
        <CollectionThumbnail
          className={`card-img w-max-none flex-auto object-cover`}
          name={collection?.name}
          thumbnail={collection?.thumbnail}
          nsfw={collection?.isNsfw}
          width="300"
        />

        <div className="grid grid-rows-2 grid-flow-col justify-between p-3">
          <div className="row-span-2 col-span-2">
            {collection && (
              <p className="text-white text-xxs sm:text-sm font-semibold text-left">
                {collection.name}
              </p>
            )}
          </div>
          {collection?.verifeyed && (
            <>
              <span className="text-gray-400 w-5 h-5 inline-block">
                <CheckShield />
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  )
}
