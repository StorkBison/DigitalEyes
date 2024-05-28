import {GO_DE_GQL_BACKEND_URL, LAUNCHPAD_BASE_URL} from "../../../constants/urls"
import {GetLaunchPadProjectInfoParams} from "./types"
import {
  getDownloadURL,
  ref,
  UploadResult,
  uploadString,
} from "firebase/storage";
import { storage,firebaseConfig } from "./firebase";


export const getLaunchPadProjectInfo = async ({projectName}:GetLaunchPadProjectInfoParams) => {
  try{
    let gqlResponseProject : any;
    let gqlResponseCollection : any;

    await fetch(GO_DE_GQL_BACKEND_URL,{
    method: "POST",
    headers: {
      'Content-type': 'application/json',
    },
    //@ts-ignore
    body: JSON.stringify({ query:`{
                              projects(Name: "${projectName}") {
                                        totalCount
                                        nodes {
                                            CollectionId
                                             Uuid
                                             Name
                                             State
                                             Creator
                                             AssetsUrl
                                             ThumbnailUrl
                                             CandyMachineKey
                                             CandyMachineConfig
                                           }
                                      }
                                    }`,
                variables:{}
    })
  })
  .then((res) => res.json())
  .then((result)=> gqlResponseProject = result.data.projects.nodes[0])


  await fetch(GO_DE_GQL_BACKEND_URL,{
  method: "POST",
  headers: {
    'Content-type': 'application/json',
  },
  //@ts-ignore
  body: JSON.stringify({ query:`{
                                  requests(collection_id: "${gqlResponseProject.CollectionId}"){
                                    totalCount
                                    nodes {
                                      	banner_public_url
                                				banner_url
                                				collection_id
                                				collection_tag_list
                                				created_at
                                				creator
                                				creator_email
                                				creator_notes
                                				description
                                				discord
                                				id
                                				is_preapproval
                                				is_preapproved
                                				is_user_admin
                                				mint_time
                                				name
                                				preapproved
                                				rejection_note
                                				replace_mint_list
                                				request_type
                                				special_tag_list
                                				stage
                                				supply
                                				thumbnail_public_url
                                				thumbnail_url
                                				twitter
                                				updated_at
                                				verifeyed
                                				wallet_address_list
                                				website
                                      }
                                    }
                                  }`,
              variables:{}
  })
})
.then((res) => res.json())
.then((result)=> gqlResponseCollection = result.data.requests.nodes[0])
const candyMachineConfig = JSON.parse(gqlResponseProject?.CandyMachineConfig)
const gqlResponse = {
      Uuid : gqlResponseProject?.Uuid,
      Name : gqlResponseProject?.Name,
      State : gqlResponseProject?.State,
      Creator : gqlResponseProject?.Creator,
      AssetsUrl : gqlResponseProject?.AssetsUrl,
      ThumbnailUrl : gqlResponseCollection?.thumbnail_public_url ? gqlResponseCollection?.thumbnail_public_url : gqlResponseProject?.ThumbnailUrl,
      BannerUrl  : gqlResponseCollection?.banner_public_url ? gqlResponseCollection?.banner_public_url : gqlResponseProject?.BannerUrl,
      IsEndorsed : gqlResponseProject?.IsEndorsed,
      IsFeatured : gqlResponseProject?.IsFeatured,
      Discord  : gqlResponseCollection?.discord,
      Twitter : gqlResponseCollection?.twitter,
      Website : gqlResponseCollection?.website,
      Description : gqlResponseCollection?.description,
      CandyMachineKey : gqlResponseProject?.CandyMachineKey,
      WhitelistEnabled : candyMachineConfig.whitelistMintSettings != null,
      PresaleEnabled : candyMachineConfig.whitelistMintSettings.presale,
      DiscountEnabled : candyMachineConfig.whitelistMintSettings.discountPrice > 0,
      DiscountPrice : candyMachineConfig.whitelistMintSettings.discountPrice,
      CandyMachineConfig: candyMachineConfig
    }

 return gqlResponse;
}catch(err){
    console.log(err);

  }
}


export async function returnHttpsUrl(fileUrl: string) {
  const url = await getDownloadURL(ref(storage, fileUrl));
  return url;
}
