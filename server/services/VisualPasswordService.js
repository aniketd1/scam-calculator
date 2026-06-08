import bcrypt from "bcryptjs";

const hashVisualPassword = async (
  sequence
) => {
  const stringPassword =
    sequence.join("-");

  return await bcrypt.hash(
    stringPassword,
    10
  );
};

const verifyVisualPassword =
  async (
    enteredSequence,
    storedHash
  ) => {
    const stringPassword =
      enteredSequence.join("-");

    return await bcrypt.compare(
      stringPassword,
      storedHash
    );
  };

export {
  hashVisualPassword,
  verifyVisualPassword
};
