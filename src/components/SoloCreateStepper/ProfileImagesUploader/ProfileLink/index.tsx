import { useContext, useState } from "react";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";
import SoloProfileContext from "../../../../contexts/solo-profile";

interface ProfileLinkProps {
  social: "discord" | "twitter" | "instagram" | "website" ;
  username: string | undefined;
  link?: string;
  isClipboard?: boolean;
}

const InstagramIcon = () => {
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext);

  return (
    <svg
      className="w-5 h-auto"
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.49505 3.15616C5.60974 3.15616 4.76069 3.50785 4.13468 4.13386C3.50867 4.75987 3.15698 5.60892 3.15698 6.49423C3.15698 7.37954 3.50867 8.22859 4.13468 8.8546C4.76069 9.48061 5.60974 9.8323 6.49505 9.8323C7.38037 9.8323 8.22942 9.48061 8.85543 8.8546C9.48144 8.22859 9.83313 7.37954 9.83313 6.49423C9.83313 5.60892 9.48144 4.75987 8.85543 4.13386C8.22942 3.50785 7.38037 3.15616 6.49505 3.15616ZM6.49505 8.6621C5.91991 8.6621 5.36832 8.43363 4.96163 8.02694C4.55494 7.62025 4.32646 7.06866 4.32646 6.49351C4.32646 5.91836 4.55494 5.36677 4.96163 4.96008C5.36832 4.55339 5.91991 4.32492 6.49505 4.32492C7.0702 4.32492 7.62179 4.55339 8.02848 4.96008C8.43517 5.36677 8.66365 5.91836 8.66365 6.49351C8.66365 7.06866 8.43517 7.62025 8.02848 8.02694C7.62179 8.43363 7.0702 8.6621 6.49505 8.6621Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
      <path
        d="M9.96522 3.81158C10.395 3.81158 10.7434 3.46316 10.7434 3.03337C10.7434 2.60357 10.395 2.25516 9.96522 2.25516C9.53543 2.25516 9.18701 2.60357 9.18701 3.03337C9.18701 3.46316 9.53543 3.81158 9.96522 3.81158Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
      <path
        d="M12.6557 2.24223C12.4885 1.81066 12.2331 1.41874 11.9058 1.09156C11.5785 0.764375 11.1865 0.509136 10.7549 0.342181C10.2498 0.152579 9.7162 0.0500575 9.17681 0.0389826C8.48162 0.00866275 8.26144 0 6.49856 0C4.73567 0 4.50972 -7.26109e-08 3.8203 0.0389826C3.28132 0.0494912 2.7481 0.152034 2.24367 0.342181C1.81193 0.508942 1.41981 0.764111 1.09248 1.09132C0.765146 1.41853 0.509827 1.81055 0.342903 2.24223C0.153263 2.74728 0.0509767 3.28092 0.0404265 3.8203C0.00938471 4.51477 0 4.73495 0 6.49856C0 8.26144 -5.37858e-09 8.48595 0.0404265 9.17681C0.051255 9.71679 0.153043 10.2496 0.342903 10.7556C0.510296 11.1871 0.765862 11.579 1.09327 11.9062C1.42068 12.2333 1.81274 12.4886 2.24439 12.6557C2.74787 12.8529 3.28131 12.9627 3.82175 12.9805C4.51694 13.0108 4.73712 13.0202 6.5 13.0202C8.26288 13.0202 8.48884 13.0202 9.17825 12.9805C9.71759 12.9695 10.2512 12.8673 10.7563 12.678C11.1879 12.5107 11.5797 12.2552 11.907 11.928C12.2343 11.6007 12.4898 11.2088 12.6571 10.7773C12.847 10.2719 12.9487 9.73917 12.9596 9.19919C12.9906 8.50472 13 8.28454 13 6.52094C13 4.75733 13 4.53354 12.9596 3.84268C12.9512 3.29568 12.8484 2.75423 12.6557 2.24223ZM11.7764 9.12339C11.7717 9.53943 11.6958 9.95158 11.5519 10.342C11.4435 10.6227 11.2775 10.8776 11.0646 11.0903C10.8518 11.3031 10.5968 11.4689 10.316 11.5771C9.92992 11.7204 9.52214 11.7963 9.1104 11.8016C8.42459 11.8334 8.23112 11.8413 6.47257 11.8413C4.71257 11.8413 4.53282 11.8413 3.83402 11.8016C3.42248 11.7966 3.0149 11.7207 2.62916 11.5771C2.3474 11.4696 2.09135 11.304 1.87759 11.0913C1.66382 10.8785 1.4971 10.6232 1.38822 10.342C1.24632 9.95578 1.17043 9.54848 1.1637 9.13711C1.13266 8.4513 1.12544 8.25783 1.12544 6.49928C1.12544 4.74001 1.12544 4.56025 1.1637 3.86073C1.16837 3.44493 1.24431 3.03301 1.38822 2.64288C1.6084 2.0733 2.05958 1.625 2.62916 1.40699C3.01509 1.26415 3.42255 1.18822 3.83402 1.18247C4.52055 1.15143 4.71329 1.14277 6.47257 1.14277C8.23184 1.14277 8.41232 1.14277 9.1104 1.18247C9.52217 1.18743 9.93001 1.26338 10.316 1.40699C10.5967 1.51547 10.8517 1.68145 11.0646 1.89429C11.2774 2.10713 11.4434 2.36211 11.5519 2.64288C11.6938 3.02906 11.7697 3.43637 11.7764 3.84773C11.8074 4.53426 11.8154 4.72701 11.8154 6.48628C11.8154 8.24484 11.8154 8.43398 11.7843 9.12411H11.7764V9.12339Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
    </svg>
  );
};

const DiscordIcon = () => {
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext);

  return (
    <svg
      className="w-5 h-auto"
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {" "}
      <path
        d="M13.5535 1.00502C12.5042 0.529349 11.3941 0.191364 10.2526 0C10.1104 0.24906 9.9443 0.584047 9.82974 0.850547C8.59899 0.671245 7.37956 0.671245 6.17143 0.850547C6.05693 0.584107 5.88706 0.24906 5.74356 0C4.60093 0.191452 3.48991 0.530298 2.44012 1.0075C0.351121 4.06604 -0.215192 7.04853 0.0679331 9.98881C1.4535 10.9913 2.79624 11.6003 4.11637 11.9988C4.44445 11.5617 4.73447 11.0989 4.98343 10.6152C4.50945 10.4404 4.05251 10.2249 3.61806 9.97137C3.73239 9.88927 3.84403 9.8037 3.95281 9.7148C6.58543 10.9078 9.44593 10.9078 12.0472 9.7148C12.1564 9.80311 12.268 9.88866 12.3819 9.97137C11.9467 10.2256 11.4889 10.4414 11.014 10.6165C11.2644 11.1021 11.5539 11.5653 11.8811 12C13.2024 11.6016 14.5464 10.9926 15.932 9.98881C16.2642 6.58032 15.3645 3.62515 13.5535 1.00496V1.00502ZM5.34212 8.18059C4.55181 8.18059 3.90368 7.46575 3.90368 6.59528C3.90368 5.72481 4.53799 5.00875 5.34212 5.00875C6.14631 5.00875 6.79437 5.72354 6.78056 6.59528C6.78181 7.46575 6.14631 8.18059 5.34212 8.18059ZM10.6578 8.18059C9.86749 8.18059 9.21943 7.46575 9.21943 6.59528C9.21943 5.72481 9.85368 5.00875 10.6578 5.00875C11.462 5.00875 12.1101 5.72354 12.0962 6.59528C12.0962 7.46575 11.462 8.18059 10.6578 8.18059Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
    </svg>
  );
};

const TwitterIcon = () => {
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext);

  return (
    <svg
      className="w-5 h-auto"
      width="16"
      height="13"
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 1.53891C15.4113 1.79991 14.7786 1.97631 14.1146 2.05567C14.7924 1.64951 15.3129 1.00634 15.5579 0.240009C14.9136 0.622291 14.2086 0.891632 13.4735 1.0364C12.8747 0.398599 12.0216 0 11.0774 0C9.26456 0 7.79475 1.46943 7.79475 3.28177C7.79475 3.53903 7.82381 3.78947 7.87975 4.02973C5.15162 3.89283 2.73287 2.5863 1.11381 0.600742C0.831312 1.08545 0.669438 1.64926 0.669438 2.25063C0.669438 3.38925 1.249 4.39372 2.12975 4.98227C1.60847 4.96595 1.09866 4.82519 0.642875 4.57174C0.642687 4.58549 0.642687 4.59923 0.642687 4.61304C0.642687 6.20313 1.77419 7.52959 3.27581 7.83108C2.79243 7.96251 2.28539 7.98175 1.79344 7.88732C2.21112 9.19116 3.42344 10.1399 4.85981 10.1665C3.73638 11.0467 2.32094 11.5714 0.783063 11.5714C0.518063 11.5714 0.256813 11.5558 0 11.5255C1.45269 12.4567 3.17813 13 5.03188 13C11.0698 13 14.3715 7.99917 14.3715 3.66238C14.3715 3.52003 14.3684 3.3785 14.362 3.23778C15.0046 2.77331 15.5593 2.19802 16 1.53891Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
    </svg>
  );
};

const WebsiteIcon = () => {
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext);

  return (
    <svg
      className="w-5 h-auto"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.2929 4.7072C9.80991 6.22578 9.78909 8.66046 8.30204 10.1558C8.29924 10.1588 8.29594 10.1621 8.2929 10.1652L6.58665 11.8714C5.08174 13.3763 2.63335 13.3761 1.12868 11.8714C-0.376226 10.3668 -0.376226 7.91809 1.12868 6.41344L2.07082 5.4713C2.32067 5.22146 2.75094 5.38751 2.76383 5.74059C2.78029 6.19057 2.86098 6.64264 3.00987 7.07921C3.06029 7.22703 3.02427 7.39055 2.91382 7.501L2.58153 7.83328C1.86993 8.54488 1.84761 9.70356 2.5522 10.4221C3.26375 11.1477 4.43329 11.1521 5.1503 10.4351L6.85655 8.72906C7.57234 8.01328 7.56934 6.85633 6.85655 6.14354C6.76258 6.04975 6.66792 5.97688 6.59398 5.92597C6.54168 5.89005 6.49849 5.84241 6.46786 5.78683C6.43724 5.73126 6.42003 5.6693 6.4176 5.6059C6.40754 5.33759 6.5026 5.06112 6.71462 4.8491L7.24919 4.31451C7.38937 4.17432 7.60928 4.15711 7.77183 4.27056C7.95799 4.40054 8.13235 4.54665 8.2929 4.7072ZM11.8713 1.1286C10.3667 -0.376098 7.91826 -0.376301 6.41336 1.1286L4.70711 2.83485C4.70406 2.83789 4.70076 2.84119 4.69796 2.84424C3.21094 4.33954 3.19009 6.77422 4.70711 8.2928C4.86765 8.45334 5.042 8.59944 5.22815 8.72942C5.3907 8.84286 5.61063 8.82562 5.75079 8.68547L6.28536 8.15087C6.49737 7.93886 6.59244 7.66238 6.58238 7.39408C6.57995 7.33067 6.56274 7.26871 6.53211 7.21314C6.50149 7.15757 6.4583 7.10992 6.40599 7.074C6.33206 7.0231 6.2374 6.95023 6.14343 6.85643C5.43064 6.14364 5.42764 4.9867 6.14343 4.27091L7.84968 2.56492C8.56668 1.84791 9.7362 1.85223 10.4478 2.57787C11.1524 3.29642 11.1301 4.45509 10.4184 5.16669L10.0862 5.49898C9.97571 5.60943 9.93968 5.77294 9.99011 5.92076C10.139 6.35733 10.2197 6.80941 10.2361 7.25938C10.2491 7.61246 10.6793 7.77852 10.9292 7.52867L11.8713 6.58653C13.3762 5.08191 13.3762 2.63324 11.8713 1.1286Z"
        style={{ fill: isProfilePage && profileTheme ? profileTheme.icons : "#fff" }}
      />
    </svg>
  );
};

export const ProfileLink: React.FC<ProfileLinkProps> = ({
  social,
  username,
  link,
  isClipboard,
}) => {
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const tooltip = useTooltipState();

  const copyUsername = () => {
    setHasCopied(true);
    //@ts-ignore
    navigator.clipboard.writeText(username);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <>
      <TooltipReference {...tooltip}>
        {isClipboard ? (
          <button onClick={copyUsername} className="flex items-center justify-center">
            {social === "discord" && <DiscordIcon />}
            {social === "twitter" && <TwitterIcon />}
            {social === "instagram" && <InstagramIcon />}
            {social === "website" && <WebsiteIcon />}
          </button>
        ) : (
          <a href={link?.includes("https://") ? link : `https://${link}`} target="_blank" className="flex items-center justify-center">
            {social === "discord" && <DiscordIcon />}
            {social === "twitter" && <TwitterIcon />}
            {social === "instagram" && <InstagramIcon />}
            {social === "website" && <WebsiteIcon />}
          </a>
        )}
      </TooltipReference>
      <Tooltip {...tooltip} style={{ background: "none" }}>
        <div className="bg-black text-xs p-2 rounded-md">
          <TooltipArrow {...tooltip} />
          {hasCopied ? "Copied to clipboard" : username}
        </div>
      </Tooltip>
    </>
  );
};
