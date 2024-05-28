//@ts-ignore
import { IKImage } from "imagekitio-react";
import { useState } from "react";
import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images";
import "../ShimmeringImage/styles.css";
import * as ROUTES from "../../constants/routes"
import { formatToHyphen } from "../../utils"
import { useHistory } from "react-router-dom";


interface CollectionThumbnailWalletProps {
  className?: string;
  nsfw?: boolean;
  width?: string;
  height?: string;
  thumbnail: string;
  name: string;
  loading?: "eager" | "lazy";
  ikImageTransformation?: any[];
}

export const CollectionThumbnailWallet = ({
  thumbnail,
  name,
  nsfw,
  width,
  height,
  className,
  ikImageTransformation,
  loading,
}: CollectionThumbnailWalletProps) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const isHttpsAddress = Boolean(thumbnail?.includes("https"));
  const nsfwClass = (nsfw) ? 'filter blur-md' : '';
  const history = useHistory();

  const imageLoaded = (parentNode: any) => {
    setLoaded(true);
  };

  const wrapperClasses = `${loaded ? "loaded" : ""} ${nsfw ? "nsfw" : ""} image-container aspect-w-16 aspect-h-16 overflow-hidden position-relative`;
  const imageClasses = `${className} ${loaded? "" : "invisible"} ${nsfw ? "filter blur-md" : ""}`;

  const goToCollection = () => {
    console.log("push");
    history.push(`${ROUTES.COLLECTIONS}/${formatToHyphen(name)}`);
  }
  return (
    <div data-width={width} data-height={height} onClick={goToCollection} className="cursor-pointer" >
      {isHttpsAddress ? (
        <img
          src={thumbnail}
          alt={name + "logo"}
          width={width}
          height={height}
          className={imageClasses}
          loading={loading}
          onLoad={imageLoaded}
        />
      ) : (
        <IKImage
          urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
          path={thumbnail}
          transformation={ikImageTransformation}
          alt={name + "logo"}
          width={width}
          height={height}
          className={imageClasses}
          loading={loading}
          onLoad={imageLoaded}
        />
      )}
      {nsfw && (
        <div className="nsfwFlag">
          <span>NSFW</span>
        </div>
      )}
    </div>
  );
};
