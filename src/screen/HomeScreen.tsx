import React from "react";
import { Button, View, Image, useNavigation } from "react-xnft";

export function HomeScreen() {
    const nav = useNavigation();

    return (
        <View style={{ height: "100%", backgroundColor: "#111827" }}>
          <View
            style={{
              marginRight: "20px",
              marginBottom: "38px",
            }}
          >
            <View
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("burnNFT")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://begltw4urlcmjke54zal2c2uj6bqh3gvzlqatqpzcy4bbgr6jvvq.arweave.net/CQy525SKxMSoneZAvQtUT4MD7NXK4AnB-RY4EJo-TWs"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("burnSPL")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://2zvs5fok5bth4sh45tim2m6wpvuqbi4v2k76jxz23ujagg4c5frq.arweave.net/1msulcroZn5I_OzQzTPWfWkAo5XSv-TfOt0SAxuC6WM"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("closeAccount")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://vyb7it5poxdx5u4r47mahmbwc6wwi35v7fenvdirzdkk5lxfnsqa.arweave.net/rgP0T691x37TkefYA7A2F61kb7X5SNqNEcjUrq7lbKA"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("revoke")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://vuhlq6wp6mjvjc57dicytcnryggyqwcsk4qt2vibir732slc34oq.arweave.net/rQ64es_zE1SLvxoFiYmxwY2IWFJXIT1VAUR_vUli3x0"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("splCreator")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://l65ahoccbiohbo5wwy2qzz3fxuhiq6ndzceytfn2kbbplgfrjljq.arweave.net/X7oDuEIKHHC7trY1DOdlvQ6IeaPIiYmVulBC9ZixStM"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("bulksender")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://3mvob66uinkhejzcay72l4u6t4wjnzpnkbb265k7mfcwskobxvcq.arweave.net/2yrg-9RDVHInIgY_pfKenyyW5e1QQ691X2FFaSnBvUU"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View>
              {/* <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("burnNFT")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://wwjptjii6qivpfzobqhnm36xuuulvti465mssuej3r2z4klgabua.arweave.net/tZL5pQj0EVeXLgwO1m_XpSi6zRz3WSlQidx1nilmAGg"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View> */}
              {/* <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("upload")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://xzexhf4i55qm2b4sexexqvihxd2jymclf3wlmbb7jdqhtlf7u6qq.arweave.net/vklzl4jvYM0HkiXJeFUHuPScMEsu7LYEP0jgeay_p6E"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View> */}
              {/* <View
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                }}
              >
                <Button
                  onClick={() =>nav.push("suatmm")}
                  style={{
                    padding: 0,
                    width: "130px",
                    height: "130px",
                    borderRadius: "6px",
                  }}
                >
                  <Image
                    src="https://yko2cz44wypwgqvhniukf227il7lp65qf7iqpwvkd5x3eofs577a.arweave.net/wp2hZ5y2H2NCp2oooutfQv63-7Av0Qfaqh9vsjiy7_4"
                    style={{
                      borderRadius: "6px",
                      width: "130px",
                    }}
                  />
                </Button>
              </View> */}
            </View>
          </View>
        </View>
    
      );
    
}