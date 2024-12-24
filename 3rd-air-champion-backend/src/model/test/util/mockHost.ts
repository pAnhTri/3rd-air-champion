import Host from "../../hostSchema";

export const createMockHost = async (email: String) => {
  const hostData = {
    email: email,
    password: "#Validpassword2",
    name: "Test Host",
  };
  return await Host.create(hostData);
};
