import PropTypes from "prop-types";
import styles from "./Typography.module.scss";

const Typography = ({ as = "p", invert, children, center, ...props }) => {
  const Component = as;

  return (
    <Component
      className={`${styles.typography} ${invert ? styles.invert : ""} ${
        center ? styles.center : ""
      }`}
      {...props}
    >
      {children}
    </Component>
  );
};

Typography.propTypes = {
  as: PropTypes.string,
  invert: PropTypes.bool,
  children: PropTypes.node,
  center: PropTypes.bool,
};

export default Typography;
